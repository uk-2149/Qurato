import Public from '@/components/auth/Public'
import RegisterPage from '@/components/Register'
import React from 'react'

function page() {
  return (
    <Public>
        <RegisterPage />
    </Public>
  )
}

export default page