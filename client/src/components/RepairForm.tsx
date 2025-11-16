import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CalendarIcon, Upload } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function RepairForm() {
  const [zipCode, setZipCode] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [pickupDate, setPickupDate] = useState<Date>();
  const [fileName, setFileName] = useState("");

  const isLocalZip = zipCode === "32168";
  
  // Calculate minimum pickup date (48 hours from now)
  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 48);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // In production, this would submit to your MERN backend
    console.log("Form submitted:", Object.fromEntries(formData));
    toast.success("Repair request submitted! We'll contact you soon.");
    
    // Reset form
    e.currentTarget.reset();
    setZipCode("");
    setDeliveryMethod("");
    setPickupDate(undefined);
    setFileName("");
  };

  return (
    <section id="repairs" className="py-20 px-4 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl mb-4">Surfboard Repairs</h2>
          <p className="text-xl text-slate-600">
            Professional ding repair and restoration services
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request a Repair</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you with a quote within 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" name="phone" type="tel" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code *</Label>
                  <Input 
                    id="zipCode" 
                    name="zipCode" 
                    required 
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
              </div>

              {/* Board Information */}
              <div className="space-y-4">
                <h3 className="text-lg">Board Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="boardSize">Board Size *</Label>
                    <Input 
                      id="boardSize" 
                      name="boardSize" 
                      placeholder="e.g., 6'2'' or 7 feet"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="boardType">Board Type</Label>
                    <Select name="boardType">
                      <SelectTrigger>
                        <SelectValue placeholder="Select board type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shortboard">Shortboard</SelectItem>
                        <SelectItem value="longboard">Longboard</SelectItem>
                        <SelectItem value="funboard">Funboard</SelectItem>
                        <SelectItem value="fish">Fish</SelectItem>
                        <SelectItem value="gun">Gun</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dingLocation">Ding Location *</Label>
                    <Select name="dingLocation" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Where is the ding?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nose">Nose</SelectItem>
                        <SelectItem value="tail">Tail</SelectItem>
                        <SelectItem value="deck">Deck</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="rail">Rail</SelectItem>
                        <SelectItem value="fin">Fin/Fin Box</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dingSize">Ding Size *</Label>
                    <Select name="dingSize" required>
                      <SelectTrigger>
                        <SelectValue placeholder="How big is the ding?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (less than 1 inch)</SelectItem>
                        <SelectItem value="medium">Medium (1-3 inches)</SelectItem>
                        <SelectItem value="large">Large (3-6 inches)</SelectItem>
                        <SelectItem value="major">Major (over 6 inches)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    placeholder="Tell us more about the damage..."
                    className="min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Upload Photo (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('photo')?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {fileName || "Choose File"}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500">
                    Upload a photo of the damage to help us provide an accurate quote
                  </p>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="space-y-4">
                <h3 className="text-lg">Delivery Method *</h3>
                <RadioGroup 
                  value={deliveryMethod} 
                  onValueChange={setDeliveryMethod}
                  name="deliveryMethod"
                  required
                >
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value="dropoff" id="dropoff" />
                    <div className="flex-1">
                      <Label htmlFor="dropoff" className="cursor-pointer">
                        Drop-off at NKS Surf
                      </Label>
                      <p className="text-sm text-slate-500 mt-1">
                        Bring your board to our shop - No additional charge
                      </p>
                    </div>
                  </div>
                  
                  {isLocalZip && (
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <div className="flex-1">
                        <Label htmlFor="pickup" className="cursor-pointer">
                          Pickup Service (+$20)
                        </Label>
                        <p className="text-sm text-slate-500 mt-1">
                          Available for 32168 zip code area
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {!isLocalZip && zipCode && (
                    <p className="text-sm text-amber-600 p-4 bg-amber-50 rounded-lg">
                      Pickup service is only available for zip code 32168. Please select drop-off or update your zip code.
                    </p>
                  )}
                </RadioGroup>
              </div>

              {/* Pickup Details */}
              {deliveryMethod === "pickup" && isLocalZip && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg">Pickup Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pickupAddress">Pickup Address *</Label>
                    <Input 
                      id="pickupAddress" 
                      name="pickupAddress"
                      placeholder="Street address"
                      required={deliveryMethod === "pickup"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Pickup Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left"
                          type="button"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {pickupDate ? pickupDate.toLocaleDateString() : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={pickupDate}
                          onSelect={setPickupDate}
                          disabled={(date) => date < minDate}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-sm text-slate-500">
                      Pickup available 48 hours from now
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pickupNotes">Pickup Instructions</Label>
                    <Textarea 
                      id="pickupNotes" 
                      name="pickupNotes"
                      placeholder="Gate code, parking instructions, etc."
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg">
                Submit Repair Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}