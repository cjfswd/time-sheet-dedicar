"use client"
import { useIsClient } from "@uidotdev/usehooks";

export default function ClientWrapper({children}:{children:React.ReactElement}){
    return useIsClient() == true ? children : null
}