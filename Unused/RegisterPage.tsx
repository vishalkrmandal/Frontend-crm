import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "react-router-dom"

const RegisterPage = () => {
  return (
    <section className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Registration or Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Name" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="father-name">Father's Name</Label>
              <Input id="father-name" type="text" placeholder="Father's Name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mother-name">Mother's Name</Label>
              <Input id="mother-name" type="text" placeholder="Mother's Name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" placeholder="Age" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone-name">Phone Number</Label>
                <Input id="phone-number" placeholder="Phone Number" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@rru.ac.in"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Password" />
            </div>
            <Button type="submit" className="w-full">
              Create an account
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to={'/login'} className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export default RegisterPage