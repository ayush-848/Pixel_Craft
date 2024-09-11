import { SignInButton, UserButton } from '@clerk/nextjs'
import React from 'react'

const Home = () => {
  return (
    <div>
      <p>Home</p>
      <SignInButton />
      <UserButton/>
    </div>
  )
}

export default Home