import { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload } from "lucide-react";
import axios from 'axios';
import { toast } from 'sonner';
import WebcamCapture from './WebcamCapture';

interface PersonalInfoFormProps {
    initialData: {
        firstname: string;
        lastname: string;
        dateofbirth: string;
        phone: string;
        email: string;
        educationLevel?: string;
        otherEducation?: string;
        isEmployed?: string;
        idDocument?: string;
        address1Document?: string;
        address2Document?: string;
    };
    setProfileData: React.Dispatch<React.SetStateAction<any>>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ initialData, setProfileData }) => {
    const [formData, setFormData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState({
        idDocument: null,
        address1Document: null,
        address2Document: null
    });

    // For previews
    const [previews, setPreviews] = useState({
        idDocument: '',
        address1Document: '',
        address2Document: ''
    });

    // Refs for file inputs
    const idDocumentRef = useRef<HTMLInputElement>(null);
    const address1DocumentRef = useRef<HTMLInputElement>(null);
    const address2DocumentRef = useRef<HTMLInputElement>(null);

    // Refs for front camera inputs
    const idFrontCameraRef = useRef<HTMLInputElement>(null);
    const address1FrontCameraRef = useRef<HTMLInputElement>(null);
    const address2FrontCameraRef = useRef<HTMLInputElement>(null);

    // Refs for rear camera inputs
    const idRearCameraRef = useRef<HTMLInputElement>(null);
    const address1RearCameraRef = useRef<HTMLInputElement>(null);
    const address2RearCameraRef = useRef<HTMLInputElement>(null);

    // Load initial previews
    useEffect(() => {
        // Helper function to get correct URL
        const getDocumentUrl = (path: string | undefined) => {
            if (!path) return '';
            return path.startsWith('http') ? path : `${API_BASE_URL.replace('/api', '')}/${path}`;
        };

        // Set initial previews from server if they exist
        if (initialData.idDocument) {
            setPreviews(prev => ({
                ...prev,
                idDocument: getDocumentUrl(initialData.idDocument)
            }));
        }

        if (initialData.address1Document) {
            setPreviews(prev => ({
                ...prev,
                address1Document: getDocumentUrl(initialData.address1Document)
            }));
        }

        if (initialData.address2Document) {
            setPreviews(prev => ({
                ...prev,
                address2Document: getDocumentUrl(initialData.address2Document)
            }));
        }
    }, [initialData, API_BASE_URL]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (value: string, name: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files: uploadedFiles } = e.target;

        if (uploadedFiles && uploadedFiles[0]) {
            // Update files state for submission
            setFiles(prev => ({
                ...prev,
                [name]: uploadedFiles[0]
            }));

            // Show file name in UI
            setFormData(prev => ({
                ...prev,
                [name]: uploadedFiles[0].name
            }));

            // Generate preview for the file
            generatePreview(uploadedFiles[0], name);
        }
    };

    const generatePreview = (file: File, fieldName: string) => {
        if (!file) return;

        // If it's a PDF, show a PDF icon or the first page
        if (file.type === 'application/pdf') {
            setPreviews(prev => ({
                ...prev,
                [fieldName]: 'PDF Document'
            }));
        } else {
            // If it's an image, create an object URL for preview
            const objectUrl = URL.createObjectURL(file);
            setPreviews(prev => ({
                ...prev,
                [fieldName]: objectUrl
            }));
        }
    };

    const openFileSelector = (ref: React.RefObject<HTMLInputElement>) => {
        if (ref.current) {
            ref.current.click();
        }
    };

    // const openCamera = (ref: React.RefObject<HTMLInputElement>) => {
    //     // First check if the browser supports mediaDevices API
    //     if (!('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices)) {
    //         toast.error("Your browser doesn't support camera access");
    //         return;
    //     }

    //     // Request camera permission explicitly before opening the camera input
    //     navigator.mediaDevices.getUserMedia({ video: true })
    //         .then(() => {
    //             // If permission granted, open the camera input
    //             if (ref.current) {
    //                 ref.current.click();
    //             }
    //         })
    //         .catch(error => {
    //             console.error("Camera access error:", error);
    //             toast.error("Camera access denied or not available");

    //             // Fall back to file upload if camera access fails
    //             if (error.name === 'NotAllowedError') {
    //                 toast.info("Please enable camera permission in your browser settings");
    //             } else if (error.name === 'NotFoundError') {
    //                 toast.error("No camera detected on your device");
    //             }
    //         });
    // };
    // Function to determine if camera is available
    // const isCameraAvailable = () => {
    //     return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    // };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('ClientToken');

            if (!token) {
                toast.error("Please login to update your profile");
                return;
            }

            // Create form data for multipart/form-data submission
            const formDataToSubmit = new FormData();

            // Add form fields
            Object.keys(formData).forEach(key => {
                // Skip the fixed fields that come from the user table
                if (!['firstname', 'lastname', 'dateofbirth', 'phone', 'email'].includes(key)) {
                    formDataToSubmit.append(key, formData[key as keyof typeof formData] as string);
                }
            });

            // Add files if they exist
            if (files.idDocument) {
                formDataToSubmit.append('idDocument', files.idDocument);
            }

            if (files.address1Document) {
                formDataToSubmit.append('address1Document', files.address1Document);
            }

            if (files.address2Document) {
                formDataToSubmit.append('address2Document', files.address2Document);
            }

            const response = await axios.post(
                `${API_BASE_URL}/api/profile/personal-info`,
                formDataToSubmit,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                toast.success("Personal information updated successfully");

                // Get the updated document paths from the response
                const updatedData = response.data.data || {};

                // Update the global profile data with the server paths
                setProfileData((prev: any) => ({
                    ...prev,
                    personalInfo: {
                        ...formData,
                        // Update with server paths if available
                        idDocument: updatedData.idDocument || formData.idDocument,
                        address1Document: updatedData.address1Document || formData.address1Document,
                        address2Document: updatedData.address2Document || formData.address2Document
                    }
                }));

                // For each document field, update the preview state appropriately
                ['idDocument', 'address1Document', 'address2Document'].forEach(field => {
                    if (updatedData[field]) {
                        const path = updatedData[field];
                        // const isServerPath = path.includes('/') || path.includes('\\');
                        const isPdf = path.toLowerCase().endsWith('.pdf');

                        // For PDF files, store the path in both formData and previews
                        if (isPdf) {
                            // Update form data with server path
                            setFormData(prev => ({
                                ...prev,
                                [field]: path
                            }));

                            // Update preview to ensure PDF view/download buttons appear
                            setPreviews(prev => ({
                                ...prev,
                                [field]: path.startsWith('http') ?
                                    path :
                                    `${API_BASE_URL.replace('/api', '')}/${formatFilePath(path)}`
                            }));
                        }
                        else {
                            setPreviews(prev => ({
                                ...prev,
                                [field]: path.startsWith('http') ?
                                    path :
                                    `${API_BASE_URL.replace('/api', '')}/${formatFilePath(path)}`
                            }));
                            // Update preview URLs with server paths
                            if (updatedData.idDocument) {
                                setPreviews(prev => ({
                                    ...prev,
                                    idDocument: updatedData.idDocument.startsWith('http') ?
                                        updatedData.idDocument :
                                        `${API_BASE_URL.replace('/api', '')}/${updatedData.idDocument}`
                                }));
                            }

                            if (updatedData.address1Document) {
                                setPreviews(prev => ({
                                    ...prev,
                                    address1Document: updatedData.address1Document.startsWith('http') ?
                                        updatedData.address1Document :
                                        `${API_BASE_URL.replace('/api', '')}/${updatedData.address1Document}`
                                }));
                            }

                            if (updatedData.address2Document) {
                                setPreviews(prev => ({
                                    ...prev,
                                    address2Document: updatedData.address2Document.startsWith('http') ?
                                        updatedData.address2Document :
                                        `${API_BASE_URL.replace('/api', '')}/${updatedData.address2Document}`
                                }));
                            }
                        }
                    }
                });
            }
        } catch (error) {
            toast.error("Failed to update personal information");
            console.error("Error updating personal info:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatFilePath = (path: string | undefined) => {
        // Replace backslashes with forward slashes for URLs
        return path ? path.replace(/\\/g, '/') : '';
    };

    // Function to render document preview
    const renderDocumentPreview = (field: 'idDocument' | 'address1Document' | 'address2Document') => {
        const preview = previews[field];
        const fileName = formData[field];

        // Check if we have a PDF by examining either the file name or preview URL
        const isPdf =
            (typeof fileName === 'string' && fileName.toLowerCase().endsWith('.pdf')) ||
            (typeof preview === 'string' && preview.toLowerCase().endsWith('.pdf'));

        if (isPdf) {
            // Construct PDF URL
            let pdfUrl = '';
            if (preview && (preview.startsWith('http') || preview.includes('/'))) {
                pdfUrl = preview;
            } else if (typeof fileName === 'string') {
                if (fileName.startsWith('http')) {
                    pdfUrl = fileName;
                } else if (fileName.includes('/') || fileName.includes('\\')) {
                    pdfUrl = `${API_BASE_URL.replace('/api', '')}/${formatFilePath(fileName)}`;
                }
            }

            if (pdfUrl) {
                return (
                    <div className="mt-2 space-y-2">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(pdfUrl, '_blank')}
                            >
                                View PDF
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const downloadLink = document.createElement('a');
                                    downloadLink.href = pdfUrl;
                                    downloadLink.download = pdfUrl.split('/').pop() || `${field}.pdf`;
                                    document.body.appendChild(downloadLink);
                                    downloadLink.click();
                                    document.body.removeChild(downloadLink);
                                }}
                            >
                                Download PDF
                            </Button>
                        </div>
                    </div>
                );
            } else {
                return <div className="mt-2">PDF will be viewable after saving</div>;
            }
        }
        // Handle image previews
        else if (preview && (preview.startsWith('blob:') || preview.startsWith('http'))) {
            return (
                <div className="mt-2 rounded border border-gray-300/80 w-fit p-2">
                    <img
                        src={preview}
                        alt={`${field} preview`}
                        className="max-w-full h-auto max-h-48 rounded"
                        onClick={() => window.open(preview, '_blank')}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
            );
        } else if (typeof fileName === 'string' &&
            (fileName.toLowerCase().endsWith('.jpg') ||
                fileName.toLowerCase().endsWith('.jpeg') ||
                fileName.toLowerCase().endsWith('.png'))) {
            // For images with path but no preview yet
            let imgUrl = '';
            if (fileName.startsWith('http')) {
                imgUrl = fileName;
            } else if (fileName.includes('/')) {
                imgUrl = `${API_BASE_URL.replace('/api', '')}/${fileName}`;
            }

            if (imgUrl) {
                return (
                    <div className="mt-2 rounded border border-gray-300 p-2">
                        <img
                            src={imgUrl}
                            alt={`${field} preview`}
                            className="max-w-full h-auto max-h-48 rounded"
                            onClick={() => window.open(imgUrl, '_blank')}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                );
            }
        }
        console.log(`Field: ${field}, FileName: ${fileName}, Preview: ${preview}`);

        return null;
    };



    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 border rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name - Read only */}
                <div className="space-y-2">
                    <Label htmlFor="firstname">First Name</Label>
                    <Input
                        id="firstname"
                        name="firstname"
                        className='border-gray-600 dark:border-gray-600'
                        value={formData.firstname}
                        disabled
                    />
                </div>

                {/* Last Name - Read only */}
                <div className="space-y-2">
                    <Label htmlFor="lastname">Last Name</Label>
                    <Input
                        id="lastname"
                        name="lastname"
                        className='border-gray-600 dark:border-gray-600'
                        value={formData.lastname}
                        disabled
                    />
                </div>

                {/* Date of Birth - Read only */}
                <div className="space-y-2">
                    <Label htmlFor="dateofbirth">Date of Birth</Label>
                    <Input
                        id="dateofbirth"
                        name="dateofbirth"
                        className='border-gray-600 dark:border-gray-600'
                        value={formData.dateofbirth ? new Date(formData.dateofbirth).toLocaleDateString() : ''}
                        disabled
                    />
                </div>

                {/* Contact Number - Read only */}
                <div className="space-y-2">
                    <Label htmlFor="phone">Contact Number</Label>
                    <Input
                        id="phone"
                        name="phone"
                        className='border-gray-600 dark:border-gray-600'
                        value={formData.phone}
                        disabled
                    />
                </div>

                {/* Email - Read only */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        className='border-gray-600 dark:border-gray-600'
                        value={formData.email}
                        disabled
                    />
                </div>

                {/* Education Level - Editable */}
                <div className="space-y-2">
                    <Label htmlFor="educationLevel">Education Level</Label>
                    <Select
                        value={formData.educationLevel}
                        onValueChange={(value) => handleSelectChange(value, 'educationLevel')}
                    >
                        <SelectTrigger className="w-full border-gray-600 dark:border-gray-600">
                            <SelectValue placeholder="Select your education level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="higher secondary">Higher Secondary</SelectItem>
                            <SelectItem value="bachelor's degree">Bachelor's Degree</SelectItem>
                            <SelectItem value="master's degree">Master's Degree</SelectItem>
                            <SelectItem value="doctorate">Doctorate</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Other Education - Only shown if "Other" is selected */}
                {formData.educationLevel === 'other' && (
                    <div className="space-y-2">
                        <Label htmlFor="otherEducation">Please Specify</Label>
                        <Input
                            id="otherEducation"
                            name="otherEducation"
                            value={formData.otherEducation || ''}
                            onChange={handleChange}
                            placeholder="Specify your education level"
                            className='border-gray-600 dark:border-gray-600'
                        />
                    </div>
                )}

                {/* Employment Status - Editable */}
                <div className="space-y-2">
                    <Label>Employment Status</Label>
                    <RadioGroup
                        value={formData.isEmployed}
                        onValueChange={(value) => handleSelectChange(value, 'isEmployed')}
                        className="flex space-x-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="employed-yes" />
                            <Label htmlFor="employed-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="employed-no" />
                            <Label htmlFor="employed-no">No</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>

            <div className=" grid grid-cols-2 gap-4 ">

                {/* ID Document Upload - Enhanced with camera and preview */}
                <div className="space-y-2 ">
                    <Label htmlFor="idDocument">ID Document (Image/PDF)</Label>

                    <div className="flex flex-wrap gap-2">
                        {/* Hidden file input */}
                        <Input
                            ref={idDocumentRef}
                            id="idDocument"
                            name="idDocument"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {/* Hidden front camera input - works on all devices */}
                        <Input
                            ref={idFrontCameraRef}
                            id="idFrontCamera"
                            name="idDocument"
                            type="file"
                            accept="image/*"
                            capture="user"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {/* Hidden rear camera input - works on all devices */}
                        <Input
                            ref={idRearCameraRef}
                            id="idRearCamera"
                            name="idDocument"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {/* Upload button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => openFileSelector(idDocumentRef)}
                            className="flex items-center"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                        </Button>

                        {/* Front Camera button */}
                        {/* <Button
                            type="button"
                            variant="outline"
                            onClick={() => openCamera(idFrontCameraRef)}
                            className="flex items-center"
                            disabled={!isCameraAvailable()}
                        >
                            <UserCircle className="mr-2 h-4 w-4" />
                            Front Camera
                        </Button> */}

                        {/* Rear Camera button */}
                        {/* <Button
                            type="button"
                            variant="outline"
                            onClick={() => openCamera(idRearCameraRef)}
                            className="flex items-center"
                            disabled={!isCameraAvailable()}
                        >
                            <Camera className="mr-2 h-4 w-4" />
                            Rear Camera
                        </Button> */}
                        <WebcamCapture
                            onCapture={(file: File, fieldName: string) => {
                                // Handle the captured image
                                setFiles(prev => ({
                                    ...prev,
                                    [fieldName]: file
                                }));

                                // Update form data to show file name
                                setFormData(prev => ({
                                    ...prev,
                                    [fieldName]: file.name
                                }));

                                // Generate preview
                                generatePreview(file, fieldName);
                            }}
                            fieldName="idDocument" // Change this for each form field
                        />

                        {/* Display file name */}
                        {/* {formData.idDocument && typeof formData.idDocument === 'string' && (
                            <span className="flex items-center text-sm text-muted-foreground">
                                {formData.idDocument.includes('/') ?
                                    `Current: ${formData.idDocument.split('/').pop()}` :
                                    `Selected: ${formData.idDocument}`}
                            </span>
                        )} */}
                    </div>

                    {/* Preview */}
                    {renderDocumentPreview('idDocument')}
                </div>

                {/* Address1 Document Upload - Enhanced with camera and preview */}
                <div className="space-y-2 ">
                    <Label htmlFor="address1Document">Address 1 Document (Image/PDF)</Label>

                    <div className="flex flex-wrap gap-2">
                        {/* Hidden file input */}
                        <Input
                            ref={address1DocumentRef}
                            id="address1Document"
                            name="address1Document"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {/* Hidden front camera input */}
                        <Input
                            ref={address1FrontCameraRef}
                            id="address1FrontCamera"
                            name="address1Document"
                            type="file"
                            accept="image/*"
                            capture="user"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {/* Hidden rear camera input */}
                        <Input
                            ref={address1RearCameraRef}
                            id="address1RearCamera"
                            name="address1Document"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {/* Upload button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => openFileSelector(address1DocumentRef)}
                            className="flex items-center"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                        </Button>

                        {/* Front Camera button */}
                        {/* <Button
                            type="button"
                            variant="outline"
                            onClick={() => openCamera(address1FrontCameraRef)}
                            className="flex items-center"
                            disabled={!isCameraAvailable()}
                        >
                            <UserCircle className="mr-2 h-4 w-4" />
                            Front Camera
                        </Button> */}

                        {/* Rear Camera button */}
                        {/* <Button
                            type="button"
                            variant="outline"
                            onClick={() => openCamera(address1RearCameraRef)}
                            className="flex items-center"
                            disabled={!isCameraAvailable()}
                        >
                            <Camera className="mr-2 h-4 w-4" />
                            Rear Camera
                        </Button> */}
                        <WebcamCapture
                            onCapture={(file: File, fieldName: string) => {
                                // Handle the captured image
                                setFiles(prev => ({
                                    ...prev,
                                    [fieldName]: file
                                }));

                                // Update form data to show file name
                                setFormData(prev => ({
                                    ...prev,
                                    [fieldName]: file.name
                                }));

                                // Generate preview
                                generatePreview(file, fieldName);
                            }}
                            fieldName="address1Document" // Change this for each form field
                        />

                        {/* Display file name */}
                        {/* {formData.address1Document && typeof formData.address1Document === 'string' && (
                            <span className="flex items-center text-sm text-muted-foreground">
                                {formData.address1Document.includes('/') ?
                                    `Current: ${formData.address1Document.split('/').pop()}` :
                                    `Selected: ${formData.address1Document}`}
                            </span>
                        )} */}
                    </div>

                    {/* Preview */}
                    {renderDocumentPreview('address1Document')}
                </div>

                {/* Address2 Document Upload - Enhanced with camera and preview */}
                <div className="space-y-2 ">
                    <Label htmlFor="address2Document">Address 2 Document (Image/PDF)</Label>

                    <div className="flex flex-wrap gap-2">
                        {/* Hidden file input */}
                        <Input
                            ref={address2DocumentRef}
                            id="address2Document"
                            name="address2Document"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {/* Hidden front camera input */}
                        <Input
                            ref={address2FrontCameraRef}
                            id="address2FrontCamera"
                            name="address2Document"
                            type="file"
                            accept="image/*"
                            capture="user"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {/* Hidden rear camera input */}
                        <Input
                            ref={address2RearCameraRef}
                            id="address2RearCamera"
                            name="address2Document"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {/* Upload button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => openFileSelector(address2DocumentRef)}
                            className="flex items-center"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                        </Button>

                        {/* Front Camera button */}
                        {/* <Button
                            type="button"
                            variant="outline"
                            onClick={() => openCamera(address2FrontCameraRef)}
                            className="flex items-center"
                            disabled={!isCameraAvailable()}
                        >
                            <UserCircle className="mr-2 h-4 w-4" />
                            Front Camera
                        </Button> */}

                        {/* Rear Camera button */}
                        {/* <Button
                            type="button"
                            variant="outline"
                            onClick={() => openCamera(address2RearCameraRef)}
                            className="flex items-center"
                            disabled={!isCameraAvailable()}
                        >
                            <Camera className="mr-2 h-4 w-4" />
                            Rear Camera
                        </Button> */}
                        <WebcamCapture
                            onCapture={(file: File, fieldName: string) => {
                                // Handle the captured image
                                setFiles(prev => ({
                                    ...prev,
                                    [fieldName]: file
                                }));

                                // Update form data to show file name
                                setFormData(prev => ({
                                    ...prev,
                                    [fieldName]: file.name
                                }));

                                // Generate preview
                                generatePreview(file, fieldName);
                            }}
                            fieldName="address2Document" // Change this for each form field
                        />

                        {/* Display file name */}
                        {/* {formData.address2Document && typeof formData.address2Document === 'string' && (
                            <span className="flex items-center text-sm text-muted-foreground">
                                {formData.address2Document.includes('/') ?
                                    `Current: ${formData.address2Document.split('/').pop()}` :
                                    `Selected: ${formData.address2Document}`}
                            </span>
                        )} */}
                    </div>

                    {/* Preview */}
                    {renderDocumentPreview('address2Document')}
                </div>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <span className="animate-spin mr-2">&#10227;</span>
                        Updating...
                    </>
                ) : 'Update Personal Information'}
            </Button>
        </form>
    );
};

export default PersonalInfoForm;