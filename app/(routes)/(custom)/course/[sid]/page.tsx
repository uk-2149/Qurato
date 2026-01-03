"use client";

import CourseLecturePage from '@/components/CoursePage'
import { useParams } from 'next/navigation';
import React from 'react'


function Page() {
    const params = useParams();
      const shareId = params.sid as string;
  return (
    <div>
        <CourseLecturePage shareId={shareId} />
    </div>
  )
}

export default Page