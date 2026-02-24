"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Shield, QrCode, Key, Copy, Download, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { authApi } from "@/services/auth.api"
import { securityApi } from "@/services/security.api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface MfaSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MfaSetupDialog({ open, onOpenChange }: MfaSetupDialogProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [setupData, setSetupData] = React.useState<{ qrCode: string; secret: string } | null>(null)
  const [token, setToken] = React.useState("")
  const [backupCodes, setBackupCodes] = React.useState<string[]>([])
  const qc = useQueryClient()

  const startSetup = useMutation({
    mutationFn: authApi.setupMfa,
    onSuccess: (res) => {
      setSetupData(res.data)
      setStep(1)
    },
    onError: () => {
      toast.error("Failed to initiate MFA setup")
      onOpenChange(false)
    },
  })

  const enableMfa = useMutation({
    mutationFn: (token: string) => authApi.enableMfa(token),
    onSuccess: (res) => {
      setBackupCodes(res.data.backupCodes)
      setStep(3)
      qc.invalidateQueries({ queryKey: ["mfa-status"] })
      toast.success("MFA enabled successfully")
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Invalid verification code")
    },
  })

  React.useEffect(() => {
    if (open) {
      startSetup.mutate()
    } else {
      // Reset state on close
      setTimeout(() => {
        setStep(1)
        setSetupData(null)
        setToken("")
        setBackupCodes([])
      }, 300)
    }
  }, [open])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const downloadBackupCodes = () => {
    const element = document.createElement("a")
    const file = new Blob([backupCodes.join("\n")], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "justicelynk-backup-codes.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <DialogTitle className="font-display">Two-Factor Authentication</DialogTitle>
          </div>
          <DialogDescription>
            {step === 1 && "Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)"}
            {step === 2 && "Enter the 6-digit code from your app to verify the setup"}
            {step === 3 && "Save these backup codes in a secure place. You can use them to access your account if you lose your phone."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {step === 1 && setupData && (
            <div className="space-y-6">
              <div className="flex justify-center p-4 bg-white rounded-2xl shadow-inner">
                <img src={setupData.qrCode} alt="MFA QR Code" className="w-48 h-48" />
              </div>
              <div className="p-4 bg-muted/40 border border-border/60 rounded-2xl space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Manual Entry Key</p>
                <div className="flex items-center justify-between gap-4">
                  <code className="text-sm font-bold font-mono text-primary break-all">{setupData.secret}</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(setupData.secret)} className="h-8 w-8 p-0 rounded-lg">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={() => setStep(2)} className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest text-xs">
                I've Scanned It
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2.5 ml-1">Verification Code</label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-6 py-4 bg-muted/40 border border-border/60 rounded-2xl text-2xl font-bold text-center tracking-[0.5em] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-card transition-all"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)} className="h-12 flex-1 rounded-2xl font-bold uppercase tracking-widest text-xs">
                  Back
                </Button>
                <Button
                  onClick={() => enableMfa.mutate(token)}
                  disabled={token.length !== 6 || enableMfa.isPending}
                  className="h-12 flex-1 rounded-2xl font-bold uppercase tracking-widest text-xs"
                >
                  {enableMfa.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Enable"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/20 border border-border/40 rounded-3xl">
                {backupCodes.map((code) => (
                  <div key={code} className="p-2 text-center text-sm font-bold font-mono bg-card/60 border border-border/20 rounded-xl">
                    {code}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => copyToClipboard(backupCodes.join("\n"))} className="h-12 flex-1 rounded-2xl font-bold uppercase tracking-widest text-xs">
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
                <Button variant="outline" onClick={downloadBackupCodes} className="h-12 flex-1 rounded-2xl font-bold uppercase tracking-widest text-xs">
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              </div>
              <Button onClick={() => onOpenChange(false)} className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest text-xs brand-gradient">
                Done, I've Saved Them
              </Button>
            </div>
          )}

          {startSetup.isPending && step === 1 && !setupData && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Generating Secure Key...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
