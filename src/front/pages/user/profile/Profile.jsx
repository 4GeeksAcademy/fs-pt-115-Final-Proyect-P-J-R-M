import { useAuth } from "../../../hooks/useAuth"

export const Profile = () => {

    const { user, loading, error } = useAuth()
    console.log(user);
    
    if (loading || !user){
        
        return <p>Cargando mamahuevo....</p>
    }
    return (
        <main>
            <section>
                <div>{user.image}</div>
                <div>{user.username}</div>
                <div>{user.email}</div>
                <div>{user.country}</div>
                <div>{user.score}</div>
            </section>
        </main>
    )
}