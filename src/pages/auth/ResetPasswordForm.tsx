// ResetPasswordForm.tsx
import { useState, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
 
  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      passwordSchema.parse(newPassword);

      const res = await fetch('http://localhost:5000/api/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      
      toast.success('Password updated successfully');
      navigate('/login');
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <form onSubmit={handleUpdatePassword} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword" 
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Password'}
      </Button>
    </form>
  );
}