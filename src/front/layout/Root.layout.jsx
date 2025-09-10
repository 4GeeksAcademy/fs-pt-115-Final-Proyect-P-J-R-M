import { Outlet } from "react-router-dom";
import { NavBar } from "../components/NavBar/NavBar";

export const RootLayout = () => {

    return (
        <>
            <NavBar />
            <Outlet />
        </>
    )
}