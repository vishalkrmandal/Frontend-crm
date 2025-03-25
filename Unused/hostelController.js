// Backend/controllers/hostelController.js
const Room = require("../models/Room");

exports.getHostelOccupancy = async (req, res) => {
  try {
    const rooms = await Room.find().populate('occupants');
    
    // Transform the data to match frontend structure
    const hostelData = ["A", "B", "C", "D", "E", "F", "G", "NBH"].map(blockId => {
      const blockRooms = rooms.filter(room => room.block === blockId);
      
      const floors = blockId === "NBH" 
        ? Array.from({ length: 5 }, (_, i) => i + 1)
        : Array.from({ length: 3 }, (_, i) => i); // 0, 1, 2 for other blocks

      return {
        id: `Block-${blockId}`,
        floors: floors.map(floorNum => ({
          id: `Floor-${floorNum}`,
          rooms: blockRooms
            .filter(room => room.floorNumber === floorNum)
            .map(room => ({
              id: room.roomNumber,
              beds: Array.from({ length: room.capacity }, (_, i) => ({
                id: `Bed-${i + 1}`,
                occupied: i < room.occupants.length
              }))
            }))
        }))
      };
    });

    res.json(hostelData);
  } catch (error) {
    console.error('Error in getHostelOccupancy:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getRoomDetails = async (req, res) => {
  try {
    const { blockId, roomId } = req.params;
    
    const room = await Room.findOne({
      block: blockId,
      roomNumber: roomId
    }).populate({
      path: 'occupants',
      select: 'name email phoneNumber gender programme state'
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const roomDetails = {
      roomNumber: room.roomNumber,
      block: room.block,
      students: room.occupants || []
    };

    res.json(roomDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};