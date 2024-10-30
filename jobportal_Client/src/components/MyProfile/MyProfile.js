'use client'

import * as React from "react"
import { Edit, LogOut, Mail, Phone, Plus } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { Button } from "../../ui/button"
import { Card, CardContent, CardHeader } from "../../ui/card"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { useSelector } from 'react-redux';
export default function MyProfile() {
  const { user } = useSelector(store => store.auth);
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <main className="flex-1 p-6">

        {/* Profile Header */}
        <Card className="mt-6">
          <div className="relative h-48 bg-gradient-to-r from-pink-200 via-purple-300 to-purple-700">
            <Button size="icon" className="absolute right-4 top-4 bg-white/20 hover:bg-white/30">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative px-6 pb-6">
            <Avatar className="absolute -top-16 h-32 w-32 border-4 border-white">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{user?.userName}</h2>
                <p className="text-muted-foreground">Q9, Ho Chi Minh</p>
              </div>
              <Button variant="outline">Chỉnh sửa hồ sơ</Button>
            </div>
          </div>
        </Card>

        {/* Two Column Layout */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            {/* About Me */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">About Me</h3>
                <Button size="icon" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tôi là nhà thiết kế sản phẩm + nhà làm phim hiện đang làm việc từ xa tại Twitter từ Manchester với 10 năm
                  kinh nghiệp. Vương quốc Anh. Tôi đam mê thiết kế các sản phẩm kỹ thuật số có tác động tích cực đến thế
                  giới.
                </p>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Experiences</h3>
                <Button size="icon" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-sky-500" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">Product Designer</h4>
                        <p className="text-sm text-muted-foreground">Twitter • Full-Time</p>
                      </div>
                      <Button size="icon" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 text-sm">Jun 2019 - Present (1y 1m)</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Created and executed social media plan for 10 brands utilizing multiple features and content types to
                      increase brand outreach, engagement, and leads.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-zinc-900" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">Growth Marketing Designer</h4>
                        <p className="text-sm text-muted-foreground">GoDaddy • Full-Time</p>
                      </div>
                      <Button size="icon" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 text-sm">Jun 2011 - May 2019 (8y)</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Developed digital marketing strategies, activation plans, proposals, contests and promotions for client
                      initiatives
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Education</h3>
                <Button size="icon" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded bg-red-100" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">Ho Chi Minh City University Of Technology and Education</h4>
                        <p className="text-sm text-muted-foreground">Engineer Degree</p>
                      </div>
                      <Button size="icon" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 text-sm">2021 - 2025</p>
                    <p className="mt-2 text-sm text-muted-foreground">Software Engineering</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Skills</h3>
                <Button size="icon" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["Giao tiếp", "Lập trình", "Tiếng Anh", "Quản lý con người", ".NET Core API"].map((skill) => (
                    <div
                      key={skill}
                      className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Thông tin khác</h3>
                <Button size="icon" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">+84 123456789</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Social Links</h3>
                <Button size="icon" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Instagram</Label>
                  <br/>
                  <a href="https://www.instagram.com/" className="text-sm text-blue-600">https://www.instagram.com/</a>
                </div>
                <div>
                  <Label className="text-sm font-medium">Twitter</Label>
                  <br/>
                  <a href="https://www.instagram.com/" className="text-sm text-blue-600">https://www.instagram.com/</a>
                </div>
                <div>
                  <Label className="text-sm font-medium">Website:</Label>
                  <br />
                  <a href="https://www.instagram.com/" className="text-sm text-blue-600">https://www.instagram.com/</a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}