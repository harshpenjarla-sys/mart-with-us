let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Join customer order tracking room
    socket.on('join-order', (orderId) => {
      socket.join(`order:${orderId}`);
    });

    // Join delivery agent broadcast room
    socket.on('join-delivery-agent', (agentId) => {
      socket.join('delivery-agents');
      if (agentId) socket.join(`agent:${agentId}`);
    });

    // Join admin room
    socket.on('join-admin', () => {
      socket.join('admin-room');
    });

    // Delivery agent sending live GPS / simulated location updates
    socket.on('agent-location-update', ({ orderId, agentId, lat, lng, heading }) => {
      io.to(`order:${orderId}`).emit('location-updated', {
        lat,
        lng,
        heading,
        lastUpdated: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });

  return io;
}

function getIO() {
  return ioInstance;
}

function emitOrderUpdate(orderId, event, data) {
  if (ioInstance) {
    ioInstance.to(`order:${orderId}`).emit(event, data);
    ioInstance.to('admin-room').emit('order-changed', { orderId, event, data });
  }
}

function emitNewDeliveryRequest(order) {
  if (ioInstance) {
    ioInstance.to('delivery-agents').emit('new-delivery-available', order);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitOrderUpdate,
  emitNewDeliveryRequest
};
