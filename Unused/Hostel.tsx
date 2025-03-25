// Frontend/src/pages/admin/Hostel.tsx
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Types for our data structures
interface Bed {
  id: string;
  occupied: boolean;
}

interface Room {
  id: string;
  beds: Bed[];
}

interface Floor {
  id: string;
  rooms: Room[];
}

interface HostelBlock {
  id: string;
  floors: Floor[];
}

interface Student {
  name: string;
  email: string;
  phoneNumber: string;
  gender: string;
  programme: string;
  state: string;
}

interface RoomDetails {
  roomNumber: string;
  block: string;
  students: Student[];
}

const Hostel: React.FC = () => {
  const [hostelData, setHostelData] = useState<HostelBlock[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [userGender, setUserGender] = useState<string>('');
  const [expandedBlocks, setExpandedBlocks] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<RoomDetails | null>(null);
  const [isRoomDetailsOpen, setIsRoomDetailsOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchHostelData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUserRole(response.data.role);
      setUserGender(response.data.gender);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchHostelData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/hostel/occupancy', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setHostelData(response.data);
    } catch (error) {
      toast.error("Failed to fetch hostel data");
      console.error('Error fetching hostel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomDetails = async (blockId: string, roomId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/hostel/room-details/${blockId}/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSelectedRoom(response.data);
      setIsRoomDetailsOpen(true);
    } catch (error) {
      toast.error("Failed to fetch room details");
      console.error('Error fetching room details:', error);
    }
  };

  const toggleBlockExpansion = (blockId: string) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  const getRoomStatus = (room: Room): string => {
    const occupiedBeds = room.beds.filter(bed => bed.occupied).length;
    if (occupiedBeds === 0) return 'white';
    if (occupiedBeds === room.beds.length) return 'black';
    return 'grey';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading hostel data...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">
        Hostel Occupancy Management
        {userRole === 'student' && (
          <span className="text-sm ml-2 text-gray-600">
            ({userGender === 'MALE' ? "Boys' Blocks" : "Girls' Blocks"})
          </span>
        )}
      </h1>
      <div className="grid grid-cols-2 gap-4">
        {hostelData.map(block => (
          <div
            key={block.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleBlockExpansion(block.id)}
            >
              <h2 className="text-lg font-semibold">{block.id}</h2>
              {expandedBlocks[block.id] ? <ChevronUp /> : <ChevronDown />}
            </div>

            {expandedBlocks[block.id] && (
              <div className="p-4">
                {block.floors.map(floor => (
                  <div key={floor.id} className="mb-4">
                    <h3 className="text-md font-medium mb-2">{floor.id}</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {floor.rooms.map(room => (
                        <div
                          key={room.id}
                          className={`p-2 rounded text-center cursor-pointer
                          ${getRoomStatus(room) === 'black' ? 'bg-black text-white' :
                              getRoomStatus(room) === 'grey' ? 'bg-gray-500 text-white' :
                                'bg-white border border-gray-300'}`}
                          onClick={() => fetchRoomDetails(block.id, room.id)}
                        >
                          <div
                            key={room.id}
                            className={`p-2 rounded text-center 
                            ${getRoomStatus(room) === 'black' ? 'bg-black text-white' :
                                getRoomStatus(room) === 'grey' ? 'bg-gray-500 text-white' :
                                  'bg-white border border-gray-300'}`}
                          >
                            {room.id}
                            <div className="flex justify-between mt-1">
                              {room.beds.map(bed => (
                                <div
                                  key={bed.id}
                                  className={`w-4 h-4 rounded-full 
                                  ${bed.occupied ? 'bg-gray-500' : 'bg-white border border-gray-300'}`}
                                  title={bed.occupied ? "Occupied" : "Vacant"}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <Dialog open={isRoomDetailsOpen} onOpenChange={setIsRoomDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Room Details - {selectedRoom?.block} Block, Room {selectedRoom?.roomNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedRoom && (
            <div className="mt-4">
              {selectedRoom.students.length === 0 ? (
                <p className="text-center text-muted-foreground">No students currently assigned to this room</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Programme</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>State</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRoom.students.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{student.programme}</TableCell>
                        <TableCell>
                          <div>
                            <p>{student.phoneNumber}</p>
                            <p className="text-sm text-muted-foreground">{student.gender}</p>
                          </div>
                        </TableCell>
                        <TableCell>{student.state}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Hostel;