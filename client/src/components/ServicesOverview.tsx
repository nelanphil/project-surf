import { Link } from "react-router-dom";
import { Wrench, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";

export function ServicesOverview() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4">Our Services</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional surfboard repairs and expert surf instruction in New Smyrna Beach
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Repairs Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Wrench className="h-8 w-8 text-blue-600" />
                <CardTitle className="text-3xl">Surfboard Repairs</CardTitle>
              </div>
              <CardDescription className="text-lg">
                Expert repairs to get your board back in the water
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                From small dings to major damage, our experienced technicians provide quality 
                repairs using premium materials. We offer detailed assessments, photo documentation, 
                and optional pickup service for local customers in the 32168 area.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full group">
                <Link to="/repairs">
                  Submit Repair Request
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Lessons Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <CardTitle className="text-3xl">Surf Lessons</CardTitle>
              </div>
              <CardDescription className="text-lg">
                Learn to surf or improve your skills with our certified instructors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Whether you're a complete beginner learning to stand up or looking to advance your 
                wave riding techniques, our tailored lesson packages guide you through every step. 
                We provide all equipment and offer both individual and small group options.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full group">
                <Link to="/lessons">
                  View Lesson Packages
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
