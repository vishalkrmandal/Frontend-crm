"use client"

import { useState } from "react"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const SampleUseCase = () => {
	const [currentPassword, setCurrentPassword] = useState("")
	const [password, setPassword] = useState("")
	const [passwordConfirmation, setPasswordConfirmation] = useState("")

	return (
		<div className="space-y-4">
			<div>
				<Label htmlFor="current_password">Current Password</Label>
				<PasswordInput
					id="current_password"
					value={currentPassword}
					onChange={(e) => setCurrentPassword(e.target.value)}
					autoComplete="current-password"
				/>
			</div>
			<div>
				<Label htmlFor="password">New Password</Label>
				<PasswordInput
					id="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					autoComplete="new-password"
				/>
			</div>
			<div>
				<Label htmlFor="password_confirmation">Confirm Password</Label>
				<PasswordInput
					id="password_confirmation"
					value={passwordConfirmation}
					onChange={(e) => setPasswordConfirmation(e.target.value)}
					autoComplete="new-password"
				/>
			</div>
			<Button type="submit">Save</Button>
		</div>
	)
}

export default SampleUseCase