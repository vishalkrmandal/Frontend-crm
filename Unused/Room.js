// Backend/models/Room.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  block: {
    type: String,
    required: true,
    enum: ["A", "B", "C", "D", "E", "F", "G", "NBH"]
  },
  blockType: {
    type: String,
    required: true,
    enum: ["MALE", "FEMALE"],
    default: function() {
      return ["A", "B", "NBH"].includes(this.block) ? "MALE" : "FEMALE";
    }
  },
  floorNumber: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        if (this.block === "NBH") {
          return value >= 0 && value <= 4;
        } else {
          return value >= 0 && value <= 2;
        }
      },
      message: props => `${props.value} is not a valid floor for block ${props.block}`
    }
  },
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return this.block === "NBH" ? value === 4 : value === 2;
      },
      message: props => `Invalid capacity for block ${props.block}`
    }
  },
  occupants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }]
});

// Watch for changes in the users collection
mongoose.connection.once('open', () => {
  const userChangeStream = mongoose.model('users').watch();
  userChangeStream.on('change', async () => {
    await initializeRooms();
  });
});


// Compound index for unique room numbers within blocks
roomSchema.index({ block: 1, roomNumber: 1 }, { unique: true });

// Room methods
roomSchema.statics.isRoomAvailable = async function(block, roomNumber) {
  const room = await this.findOne({ block, roomNumber });
  if (!room) {
    throw new Error("Room not found");
  }
  return room.occupants.length < room.capacity;
};

// Generate room number based on block type
roomSchema.statics.generateRoomNumber = function(block, floor, room) {
  if (block === "NBH") {
    return `${floor}${room.toString().padStart(2, '0')}`;
  } else {
    // For blocks A-G: Format G01, G02, etc. (G for ground floor)
    const floorPrefix = floor === 0 ? 'G' : floor.toString();
    return `${floorPrefix}${room.toString().padStart(2, '0')}`;
  }
};

// Initialize rooms function
const initializeRooms = async () => {
  try {
    const Room = mongoose.model("Room", roomSchema);
    const count = await Room.countDocuments();
    
    if (count === 0) {
      const rooms = [];

      // Initialize NBH block (5 floors, 10 rooms per floor, 4 capacity)
      for (let floor = 1; floor <= 4; floor++) {
        for (let room = 1; room <= 22; room++) {
          rooms.push({
            block: "NBH",
            floorNumber: floor,
            roomNumber: Room.generateRoomNumber("NBH", floor, room),
            capacity: 4,
            occupants: []
          });
        }
      }

      // Initialize blocks A to G
      const blocks = ["A", "B", "C", "D", "E", "F", "G"];
      blocks.forEach(block => {
        // Ground and first floor: 8 rooms each
        for (let floor = 0; floor <= 1; floor++) {
          for (let room = 1; room <= 8; room++) {
            rooms.push({
              block,
              floorNumber: floor,
              roomNumber: Room.generateRoomNumber(block, floor, room),
              capacity: 2,
              occupants: []
            });
          }
        }
        // Second floor: 4 rooms
        for (let room = 1; room <= 4; room++) {
          rooms.push({
            block,
            floorNumber: 2,
            roomNumber: Room.generateRoomNumber(block, 2, room),
            capacity: 2,
            occupants: []
          });
        }
      });

      await Room.insertMany(rooms);
      console.log("Rooms initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing rooms:", error);
  }
};

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
module.exports.initializeRooms = initializeRooms;