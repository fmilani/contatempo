import {useEffect} from 'react';
import Nav from '../components/nav'

export default function Home() {
  useEffect(() => {
    const fetchData = async () => {
      const r = await fetch('/api/record')
      const t = await r.text()
      console.log(t)
    }
    fetchData()
  })
  return (
    <div>
      <Nav />
      <main>
        <h1>Welcome to Contatempo</h1>
      </main>
    </div>
  );
}
