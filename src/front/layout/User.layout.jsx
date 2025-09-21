import { Outlet } from "react-router-dom";
import { NavBar } from "../components/navbar/NavBar";


export const UserLayout = () => {

    return (
        <>
            <NavBar />
            <Outlet />
        </>
    )
}