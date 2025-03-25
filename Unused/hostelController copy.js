// Backend/controllers/hostelController.js
const Room = require('../models/Room');
const User = require('../models/User');

exports.getHostelOccupancy = async (req, res) => {
  try {
    const user = req.user; // From auth middleware
    let roomQuery = {};

    // Filter blocks based on user role and gender
    if (!['admin', 'staff', 'director'].includes(user.role)) {
      if (user.role === 'student') {
        const blockType = user.gender === 'MALE' ? 'MALE' : 'FEMALE';
        roomQuery.blockType = blockType;
      }
    }

    const rooms = await Room.find(roomQuery).populate('occupants');
    
    // Transform the data to match frontend structure
    let blocks = ["NBH", "A", "B", "C", "D", "E", "F", "G"];
    
    // Filter blocks based on user role and gender
    if (!['admin', 'staff', 'director'].includes(user.role)) {
      if (user.role === 'student') {
        blocks = user.gender === 'MALE' 
          ? ["NBH", "A", "B"]
          : ["C", "D", "E", "F", "G"];
      }
    }

    const hostelData = blocks.map(blockId => {
      const blockRooms = rooms.filter(room => room.block === blockId);
      
      const maxFloors = blockId === "NBH" ? 5 : 3;
      const floors = Array.from({ length: maxFloors }, (_, i) => i);

      return {
        id: blockId,
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
    res.status(500).json({ message: 'Internal server error' });
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
      model: 'users',
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
    console.error('Error in getRoomDetails:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getUserHostel = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};