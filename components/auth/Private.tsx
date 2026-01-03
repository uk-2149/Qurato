import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

export const dynamic = "force-dynamic";

const Private = async({children} : { children: React.ReactNode }) => {
    const session = await getServerSession(authOptions);
    
    if(!session) {
        redirect('/login');
    }

    return <div>{children}</div>;
}

export default Private;