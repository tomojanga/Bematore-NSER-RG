import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { useToast } from '@/components/ui/use-toast'
import { Fingerprint, Shield } from 'lucide-react'

interface BiometricAuthPromptProps {
  onComplete: () => void
  onSkip: () => void
}

export function BiometricAuthPrompt({
  onComplete,
  onSkip
}: BiometricAuthPromptProps) {
  const { toast } = useToast()
  const { registerBiometric, isBiometricSupported } = useAuth()
  const [isRegistering, setIsRegistering] = useState(false)

  const handleRegister = async () => {
    if (!isBiometricSupported) {
      toast({
        title: "Error",
        description: "Your browser doesn't support biometric authentication",
        variant: "destructive",
        duration: 5000
      })
      return
    }

    setIsRegistering(true)
    try {
      await registerBiometric()
      toast({
        title: "Success",
        description: "Biometric authentication registered successfully",
        variant: "default",
        duration: 3000
      })
      onComplete()
    } catch (error: any) {
      let errorMessage = "Failed to register biometric authentication"
      if (error.name === 'NotAllowedError') {
        errorMessage = "You denied the biometric authentication request"
      } else if (error.name === 'NotSupportedError') {
        errorMessage = "Your device doesn't support the requested biometric method"
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center text-center pt-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-full mb-4">
          <Shield className="h-12 w-12 text-white" />
        </div>
        <CardTitle className="mb-2">Enable Biometric Login</CardTitle>
        <CardDescription className="mb-6">
          Use your fingerprint, face recognition, or other biometric method to sign in quickly and securely.
        </CardDescription>

        <CardFooter className="flex-col space-y-4 w-full">
          <Button
            onClick={handleRegister}
            disabled={isRegistering}
            className="w-full"
            variant="primary"
          >
            {isRegistering ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Registering...
              </>
            ) : (
              <>
                <Fingerprint className="h-5 w-5 mr-2" />
                Enable Biometric Login
              </>
            )}
          </Button>
          <Button
            onClick={onSkip}
            variant="outline"
            className="w-full"
          >
            Skip for Now
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  )
}