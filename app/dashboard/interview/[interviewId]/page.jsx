"use client";

import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Lightbulb, WebcamIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function Interview({ params }) {
  const [interviewData, setInterviewData] = useState();
  const [webCamEnabled, setWebCamEnabled] = useState(false);

  useEffect(() => {
    console.log(params.interviewId);
    GetInterviewDetails();
  }, [params.interviewId]);

  const GetInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));
    setInterviewData(result[0]);
  };

  return (
    <div className="container mx-auto my-10">
      <h2 className="font-bold text-2xl text-center mb-8">Let's Get Started</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left side - Interview Data */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-5 p-5 rounded-lg border">
            {interviewData ? (
              <div className="space-y-4">
                <h2 className="text-lg">
                  <strong>Job Role/Job Position:</strong>{" "}
                  {interviewData.jobPosition}
                </h2>
                <h2 className="text-lg">
                  <strong>Job Description/Tech Stack:</strong>{" "}
                  {interviewData.jobDesc}
                </h2>
                <h2 className="text-lg">
                  <strong>Years of experience:</strong>{" "}
                  {interviewData.jobExperience}
                </h2>
              </div>
            ) : (
              <p>Loading interview data...</p>
            )}
          </div>
          <div className="p-5 border rounded-lg border-yellow-300 bg-yellow-100">
            <h2 className="flex gap-2 items-center text-yellow-600">
              <Lightbulb />
              <strong>Information</strong>
            </h2>
            <h2 className="mt-3 text-yellow-700">
              {process.env.NEXT_PUBLIC_INFORMATION}
            </h2>
          </div>
        </div>

        {/* Right side - Webcam */}
        <div className="flex flex-col items-center justify-center h-full">
          {webCamEnabled ? (
            <Webcam
              onUserMedia={() => setWebCamEnabled(true)}
              onUserMediaError={() => setWebCamEnabled(false)}
              mirrored={true}
              className="rounded-lg shadow-lg w-full h-auto"
            />
          ) : (
            <div className="text-center w-full">
              <WebcamIcon className="h-72 w-full mx-auto mb-4 p-8 bg-secondary rounded-lg border" />
              <Button variant="ghost" onClick={() => setWebCamEnabled(true)} className="mt-4">
                Enable Web Cam and Microphone
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end items-end mt-5">
        <Button>Start Interview</Button>
      </div>
    </div>
  );
}

export default Interview;