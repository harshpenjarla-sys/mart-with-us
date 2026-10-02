const DeliveryAgent = require('../models/DeliveryAgent');
const Order = require('../models/Order');

class DeliveryAssignmentService {
  /**
   * Calculate distance between two coordinate pairs using Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  }

  /**
   * Calculate payout for an agent based on distance
   */
  calculateAgentPayout(distanceKm) {
    const basePayout = 40;
    const perKmRate = 8;
    return Math.round(basePayout + Math.max(0, distanceKm - 2) * perKmRate);
  }

  /**
   * Find suitable candidate agents for an order
   */
  async findEligibleAgents(order) {
    const allAgents = await DeliveryAgent.find({
      verificationStatus: 'APPROVED'
    });

    const storeLat = 18.5590;
    const storeLng = 73.7868;

    return allAgents.map(agent => {
      const agentLat = agent.currentLocation?.lat || 18.5590;
      const agentLng = agent.currentLocation?.lng || 73.7868;
      const distance = this.calculateDistance(storeLat, storeLng, agentLat, agentLng);
      return {
        agent,
        distance,
        isOnline: agent.availability?.isOnline !== false,
        isBusy: Boolean(agent.availability?.isBusy)
      };
    }).sort((a, b) => {
      // Prioritize online, idle, closest agents
      if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
      if (a.isBusy !== b.isBusy) return a.isBusy ? 1 : -1;
      return a.distance - b.distance;
    });
  }

  /**
   * Assign an order to a specific agent
   */
  async assignOrderToAgent(orderId, agentId) {
    const agent = await DeliveryAgent.findById(agentId);
    if (!agent) throw new Error('Delivery agent not found');

    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
      orderStatus: 'ASSIGNED',
      deliveryAgent: {
        agentId: String(agent._id),
        name: agent.fullName,
        phone: agent.phone,
        profilePhoto: agent.profilePhoto,
        vehicleType: agent.vehicleType,
        vehicleNumber: agent.vehicleNumber,
        rating: agent.rating || 4.8
      },
      liveLocation: {
        lat: agent.currentLocation?.lat || 18.5590,
        lng: agent.currentLocation?.lng || 73.7868,
        heading: 0,
        lastUpdated: new Date()
      },
      $push: {
        timeline: {
          status: 'ASSIGNED',
          title: 'Delivery Partner Assigned',
          time: new Date(),
          note: `${agent.fullName} (${agent.vehicleType} - ${agent.vehicleNumber}) has accepted your delivery.`
        }
      }
    }, { new: true });

    // Update agent state
    await DeliveryAgent.findByIdAndUpdate(agentId, {
      'availability.isBusy': true,
      'availability.activeOrderId': order.orderId
    });

    return { success: true, order: updatedOrder, agent };
  }
}

module.exports = new DeliveryAssignmentService();
