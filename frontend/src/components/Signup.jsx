import React, { useState } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import { Button, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");

    const handleChange = (e) => {
        setRole(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fullName || !email || !password || !role) {
            toast.error("All fields are required.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/api/user/register", {
                full_name: fullName,
                email,
                password,
                role,
            });

            toast.success("User registered successfully!");
        } catch (err) {
            if (err.response && err.response.data) {
                toast.error(err.response.data.message || "An error occurred while registering.");
            } else {
                toast.error("An unexpected error occurred.");
            }
        }
    };

    return (
        <div className="w-screen h-screen items-center justify-center flex">
            <form
                className="self-center mx-10 mt-6 space-y-4 flex flex-col justify-center items-center lg:h-4/5 lg:w-1/4 w-2/3 h-3/4 border border-neutral-900 rounded-2xl p-10"
                onSubmit={handleSubmit}
            >
                <h2>SignUp</h2>

                <TextField
                    label="Enter Full Name"
                    variant="outlined"
                    onChange={(e) => setFullName(e.target.value)}
                    className="lg:w-5/6"
                />

                <FormControl className="lg:w-5/6 w-full">
                    <InputLabel id="role-select-label">Role</InputLabel>
                    <Select
                        labelId="role-select-label"
                        value={role}
                        onChange={handleChange}
                    >
                        <MenuItem value="banker">Banker</MenuItem>
                        <MenuItem value="customer">Customer</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label="Enter Email Id"
                    variant="outlined"
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="lg:w-5/6"
                />

                <TextField
                    label="Enter Password"
                    variant="outlined"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="lg:w-5/6"
                />

                <Button
                    variant="contained"
                    className="border border-neutral-900 w-44 h-9 text-xl"
                    type="submit"
                >
                    Sign Up
                </Button>
            </form>

            <ToastContainer />
        </div>
    );
};

export default Signup;
