"use client"

import { FolderNode } from "@/lib/normalize-path"
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Collapse, Container, Divider } from "@mui/material"
import { ReactNode, useState } from "react"
import DarkModeSwitcher from "../components/darkmodeSwitcher"
import { Tray } from "../components/navbar"
import Link from "next/link"

export default function View({ tree, children }: { tree: FolderNode | null, children: ReactNode }) {
    const [open, setOpen] = useState(true)
    return <div>
        <div className='flex justify-center relative w-full'>
            <Collapse orientation='horizontal' in={open}>
                <div className="flex w-[300px] h-screen p-4 overflow-y-scroll scrollbar-hide">
                    <div className='w-full h-full py-6 flex flex-col gap-4'>
                        <div className='flex items-center justify-between'>
                            <DarkModeSwitcher />
                            <div className="flex gap-4 pr-4 items-center">
                                <Link className="no-underline" href="/">Home</Link>
                                <Link className="no-underline" href="/about">About</Link>
                            </div>
                        </div>
                        <p> Directory </p>
                        <Divider />
                        <Tray tree={tree} pl={6} />
                    </div>
                    <Divider orientation="vertical" />
                </div>
            </Collapse>
            <div className='container w-[calc(100%-300px)]'>
                {children}
            </div>
        </div>
    </div>
}