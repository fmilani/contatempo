import GoogleLoginButton from "@/components/GoogleLoginButton"
import GithubLoginButton from "@/components/GithubLoginButton"

export default async function Home() {
  return (
    <div>
      <h1>Contatempo</h1>
      <div>
        <GoogleLoginButton />
      </div>
      <div>
        <GithubLoginButton />
      </div>
    </div>
  )
}
