import { useAuth } from "../../../../hooks/useAuth"

export const ProfileImage = () => {

    const {user} = useAuth()

    return (
        <div>
            <img src={user.image} alt="Imagen de perfil" />
        </div>
    )
}