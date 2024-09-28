"use client"

import { Record } from "@/lib/api"
import {
  CheckCircle,
  Loader2,
  PlayCircle,
  PlusCircle,
  StopCircle,
  X,
} from "lucide-react"
import Duration from "./Duration"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { startStopRecord } from "../actions"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

interface CurrentRecordProps {
  record?: Record
  now: Date
  setOptimisticRecords: any
}

export default function CurrentRecord({
  record,
  now,
  setOptimisticRecords,
}: CurrentRecordProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const dateRef = useRef<HTMLInputElement>(null)
  const beginRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLInputElement>(null)
  async function handle() {
    if (
      !dateRef.current?.value ||
      !beginRef.current?.value ||
      !endRef.current?.value
    )
      return
    setIsSaving(true)
    await fetch(`/api/records`, {
      method: "POST",
      body: JSON.stringify({
        begin: new Date(dateRef.current.value + "T" + beginRef.current.value),
        end: new Date(dateRef.current.value + "T" + endRef.current.value),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((r) => r.json())
    setIsSaving(false)
    setIsOpen(false)
    router.refresh()
  }
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const tagName = target.tagName.toLowerCase()
      if (
        tagName === "input" ||
        tagName === "textarea" ||
        target.isContentEditable
      ) {
        return
      }
      if (event.key === "s") {
        formRef.current?.requestSubmit()
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [])
  return (
    <div className="flex justify-between gap-4">
      <Card
        className={cn(
          "overflow-hidden",
          record && "w-full",
          isOpen && "hidden",
        )}
      >
        <CardHeader className="p-2">
          <form
            ref={formRef}
            action={async () => {
              const time = new Date()
              setOptimisticRecords({ action: "edit", newRecord: record, time })
              await startStopRecord(record, time)
            }}
          >
            <div className={cn("flex items-center justify-between")}>
              <Button type="submit" variant="ghost" size="icon">
                {record ? <StopCircle /> : <PlayCircle />}
              </Button>
              {record && now && (
                <span className="pr-4 text-lg font-bold">
                  <Duration
                    records={[{ begin: record.begin, end: now }]}
                    now={now}
                  />
                </span>
              )}
            </div>
          </form>
        </CardHeader>
      </Card>
      <Card className={cn(isOpen && "w-full", record && "hidden")}>
        <CardHeader className="p-2">
          <div className="flex flex-row items-center justify-between gap-1">
            {isOpen && (
              <div className="flex flex-row items-center overflow-auto">
                <input
                  id="date"
                  type="date"
                  ref={dateRef}
                  className="block"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
                <input
                  id="begin"
                  type="time"
                  ref={beginRef}
                  className="block"
                />
                <input id="end" type="time" ref={endRef} className="block" />
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isSaving}
                  onClick={() => {
                    handle()
                  }}
                  className="inline-flex items-center"
                >
                  <CheckCircle />
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              disabled={isSaving}
              className="inline-flex items-center"
              onClick={() => {
                setIsOpen(!isOpen)
              }}
            >
              {!isOpen ? (
                <PlusCircle />
              ) : isSaving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <X />
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
