import Public from '@/components/auth/Public'
import LoginPage from '@/components/Login'
import React from 'react'

function page() {
  return (
    <Public>
        <LoginPage />
    </Public>
  )
}

export default page