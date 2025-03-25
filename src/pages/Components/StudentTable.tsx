// Frontend/src/pages/Components/StudentTable.tsx
import { useState, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getStudents, updateStudent, deleteStudent } from "@/api/studentApi";
import { ChevronDown } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  roomNo: string;
  block: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  state: string;
  school: string;
  programme: string;
  dateOfAdmission: string;
}

interface UpdateStudentData {
  name: string;
  roomNo: string;
  block: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  state: string;
}

interface Column {
  id: keyof Student;
  label: string;
  checked: boolean;
}

type FilterValue = string | "all";

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const programmeOptions = [
  { value: "btech", label: "B.Tech" },
  { value: "mtech", label: "M.Tech" },
  { value: "msc", label: "M.Sc" },
  { value: "phd", label: "Ph.D" },
  { value: "mba", label: "MBA" },
  { value: "ma", label: "MA" },
  { value: "diploma", label: "Diploma" }
];

const schoolOptions = [
  { value: "sissp", label: "School of Internal Security and SMART Policing (SISSP)" },
  { value: "sitaics", label: "School of IT, Artificial Intelligence and Cyber Security (SITAICS)" },
  { value: "sicmss", label: "School of Integrated Coastal and Maritime Security Studies (SICMSS)" },
  { value: "sisdss", label: "School of Internal Security, Defence and Strategic Studies (SISDSS)" },
  { value: "sicssl", label: "School of International Cooperation, Security and Strategic Languages (SICSSL)" },
  { value: "sbsfi", label: "School of Behavioural Sciences and Forensic Investigations (SBSFI)" },
  { value: "sclml", label: "School of Criminal Law and Military Law (SCLML)" },
  { value: "spicsm", label: "School of Private, Industrial and Corporate Security Management (SPICSM)" },
  { value: "spes", label: "School of Physical Education and Sports (SPES)" },
  { value: "bcore", label: "Bharat Centre of Olympic Research And Education (BCORE)" },
  { value: "sastra", label: "Security And Scientific Technical Research Association(SASTRA)" },
  { value: "saset", label: "School of Applied Sciences, Engineering and Technology (SASET)" }
];

const block = ["A", "B", "C", "D", "E", "F", "G", "NBH"];

export default function StudentTable() {
  // States
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Filter states
  const [selectedGender, setSelectedGender] = useState<FilterValue>("all");
  const [selectedSchool, setSelectedSchool] = useState<FilterValue>("all");
  const [selectedProgram, setSelectedProgram] = useState<FilterValue>("all");
  const [selectedBlock, setSelectedBlock] = useState<FilterValue>("all");
  const [selectedState, setSelectedState] = useState<FilterValue>("all");
  const [selectedYear, setSelectedYear] = useState<FilterValue>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Table states
  const [columns, setColumns] = useState<Column[]>([
    { id: 'name', label: 'Name', checked: true },
    // { id: 'email', label: 'Email', checked: true },
    { id: 'roomNo', label: 'Room No', checked: true },
    { id: 'block', label: 'Block', checked: true },
    { id: 'school', label: 'School', checked: true },
    { id: 'programme', label: 'Programme', checked: true },
    { id: 'phone', label: 'Phone', checked: true },
    { id: 'gender', label: 'Gender', checked: true },
    { id: 'state', label: 'State', checked: true },
  ]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Effects
  useEffect(() => {
    fetchStudents();
  }, [
    selectedGender,
    selectedSchool,
    selectedProgram,
    selectedBlock,
    selectedState,
    selectedYear,
    searchTerm
  ]);

  useEffect(() => {
    if (editingStudent?.dateOfBirth) {
      setDate(new Date(editingStudent.dateOfBirth));
    }
  }, [editingStudent]);

  // Data fetching
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const filterParams = {
        ...(searchTerm && { search: searchTerm }),
        ...(selectedGender !== 'all' && { gender: selectedGender }),
        ...(selectedSchool !== 'all' && { school: selectedSchool }),
        ...(selectedProgram !== 'all' && { programme: selectedProgram }),
        ...(selectedBlock !== 'all' && { block: selectedBlock }),
        ...(selectedState !== 'all' && { state: selectedState }),
        ...(selectedYear !== 'all' && { year: selectedYear })
      };

      const data = await getStudents(
        Object.keys(filterParams).length > 0 ? filterParams : undefined
      );
      console.log(data);
      setStudents(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to fetch students");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };


  // Filter handlers
  const resetFilters = () => {
    setSelectedGender("all");
    setSelectedSchool("all");
    setSelectedProgram("all");
    setSelectedBlock("all");
    setSelectedState("all");
    setSelectedYear("all");
    setSearchTerm('');
    fetchStudents();
  };

  // Apply filters
  const filteredStudents = students
    .filter(student =>
      Object.values(student).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .filter(student =>
      selectedGender === 'all' || student.gender === selectedGender
    )
    .filter(student =>
      selectedSchool === 'all' || student.school === selectedSchool
    )
    .filter(student =>
      selectedProgram === 'all' || student.programme === selectedProgram
    )
    .filter(student =>
      selectedBlock === 'all' || student.block === selectedBlock
    )
    .filter(student =>
      selectedState === 'all' || student.state === selectedState
    )
    .filter(student =>
      selectedYear === 'all' ||
      new Date(student.dateOfAdmission).getFullYear().toString() === selectedYear
    );

  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // CRUD handlers
  const handleEdit = async (formData: UpdateStudentData) => {
    try {
      if (!editingStudent) return;

      await updateStudent(editingStudent.id, formData);
      setIsEditOpen(false);
      await fetchStudents();
      toast.success("Student updated successfully");
    } catch (error) {
      console.error('Update error:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to update student");
      } else {
        toast.error("Failed to update student");
      }
    }
  };

  const handleDelete = async (student: Student) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteStudent(student.id, "Admin deletion");
      toast.success("Student deleted successfully");
      await fetchStudents();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Failed to delete student");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      const formData = new FormData(e.currentTarget);
      const gender = formData.get('gender');
      const state = formData.get('state');

      if (!gender || !state || !date) {
        toast.error("Please fill all required fields");
        return;
      }

      const data = {
        name: formData.get('name') as string,
        dateOfBirth: formData.get('dateOfBirth') as string,
        phoneNumber: formData.get('phoneNumber') as string,
        gender: gender as string,
        block: formData.get('block') as string,
        roomNo: formData.get('roomNo') as string,
        state: state as string
      };

      handleEdit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error("Failed to update student");
    }
  };

  return (
    <div className="w-auto">
      {/* Search and Filter Controls */}
      <div className="flex items-center py-4">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.checked}
                onCheckedChange={(checked) =>
                  setColumns((prev) =>
                    prev.map((col) =>
                      col.id === column.id ? { ...col, checked } : col
                    )
                  )
                }
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="ml-2"
        >
          Reset Filters
        </Button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-4 py-4">
        {/* Gender Filter */}
        <div className="flex items-center space-x-2">
          <Select
            onValueChange={setSelectedGender}
            value={selectedGender}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* School Filter */}
        <div className="flex items-center space-x-2">
          <Select
            onValueChange={setSelectedSchool}
            value={selectedSchool}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by school" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {schoolOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Program Filter */}
        <div className="flex items-center space-x-2">
          <Select
            onValueChange={setSelectedProgram}
            value={selectedProgram}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programmeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Block Filter */}
        <div className="flex items-center space-x-2">
          <Select
            onValueChange={setSelectedBlock}
            value={selectedBlock}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by block" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blocks</SelectItem>
              {block.map(blockValue => (
                <SelectItem key={blockValue} value={blockValue}>
                  Block {blockValue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* State Filter */}
        <div className="flex items-center space-x-2">
          <Select
            onValueChange={setSelectedState}
            value={selectedState}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map(state => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Filter */}
        <div className="flex items-center space-x-2">
          <Select
            onValueChange={setSelectedYear}
            value={selectedYear}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="2020">2020</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) =>
                column.checked && (
                  <TableHead key={column.id} className="min-w-[100px]">
                    {column.label}
                  </TableHead>
                )
              )}
              <TableHead className="sticky right-0 bg-background">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.filter(c => c.checked).length + 1}
                  className="h-24 text-center"
                >
                  Loading students...
                </TableCell>
              </TableRow>
            ) : paginatedStudents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.filter(c => c.checked).length + 1}
                  className="h-24 text-center"
                >
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              paginatedStudents.map((student) => (
                <TableRow key={student.id}>
                  {columns.map((column) =>
                    column.checked && (
                      <TableCell key={column.id}>
                        {column.id === 'name' ? (
                          <div>
                            <div>{student[column.id]}</div> {/* Display the name */}
                            <div className="text-sm text-muted-foreground">{student.email}</div> {/* Display the email */}
                          </div>
                        ) : (column.id === 'gender' || column.id === 'school') ? (
                          student[column.id]?.toUpperCase() // Convert to uppercase for gender and school
                        ) : (
                          student[column.id] // Otherwise, display as-is
                        )}
                      </TableCell>
                    )
                  )}
                  <TableCell className="sticky right-0 bg-background">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingStudent(student);
                          setIsEditOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(student)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-4">
        <p className="text-sm text-muted-foreground">
          {filteredStudents.length} total students
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name Field */}
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  name="name"
                  defaultValue={editingStudent?.name || ''}
                  required
                />
              </div>

              {/* Date of Birth Field */}
              <div>
                <label className="text-sm font-medium">Date of Birth</label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  className="w-full"
                  defaultValue={editingStudent?.dateOfBirth || ''}
                  required
                />
              </div>

              {/* Gender Field */}
              <div>
                <label className="text-sm font-medium">Gender</label>
                <Select name="gender" defaultValue={editingStudent?.gender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Room Fields */}
              <div>
                <label className="text-sm font-medium">Room No</label>
                <Input
                  name="roomNo"
                  defaultValue={editingStudent?.roomNo || ''}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Block</label>
                <Select name="block" defaultValue={editingStudent?.block}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select block" />
                  </SelectTrigger>
                  <SelectContent>
                    {block.map((b) => (
                      <SelectItem key={b} value={b}>
                        Block {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Fields */}
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  name="phoneNumber"
                  defaultValue={editingStudent?.phone || ''}
                  required
                />
              </div>

              {/* State Field */}
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">State</label>
                <Select name="state" defaultValue={editingStudent?.state}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
};