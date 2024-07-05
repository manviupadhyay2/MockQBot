"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic, Square } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModal";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { db } from "@/utils/db";
import moment from "moment";

function RecordAnswerSection({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
    crossBrowser: true,
  });

  if (error) return <p>Web Speech API is not available in this browser 🤷‍</p>;

  useEffect(() => {
    if (error) {
      console.error("Speech recognition error:", error);
    }
  }, [error]);

  useEffect(() => {
      results?.map((result) => {
          setUserAnswer(prevAns => prevAns + result.transcript)
      })

  }, [results]);

  useEffect(()=>{
    if(!isRecording && userAnswer.length>10){
      UpdateUserAnswer();
    }
  
  },[userAnswer])

  const handlePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error("Microphone permission error:", err);
    }
  };

  useEffect(() => {
    handlePermission();
  }, []);

  const StartStopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
    }
    else {
      startSpeechToText();
    }
  };

  const UpdateUserAnswer=async()=>{
    console.log(userAnswer)
    setLoading(true)
    const feedbackPrompt =
        "Question:" +
        mockInterviewQuestion[activeQuestionIndex]?.Question+
        ",User Answer:" +
        userAnswer +
        ",Depends on question and user answer for given interview question" +
        " please give us rating on the scale of 10 for answer and feedback as area of improvement if any" +
        " in just 3 to 5 lines to improve it in JSON format with rating field and feedback field.";

      const result = await chatSession.sendMessage(feedbackPrompt);
      const mockJsonResp =result.response.text().replace('```json', '').replace('```','');
      console.log(mockJsonResp);
      const JsonFeedbackResp=JSON.parse(mockJsonResp);
      const resp = await db.insert(UserAnswer).values({
        mockIdRef: interviewData?.mockId,
        question:mockInterviewQuestion[activeQuestionIndex]?.Question,
        correctAns:mockInterviewQuestion[activeQuestionIndex]?.Answer,
        userAns: userAnswer,
        rating:JsonFeedbackResp?.rating,
        feedback: JsonFeedbackResp?.feedback,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("DD-MM-yyyy"),
      });

      if (resp) {
        toast("User Answer recorded successfully");
        setResults([]); 
      }
      setResults([]);
      
      setLoading(false);
  }

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col justify-center items-center rounded-lg pd-5 mt-20 bg-black">
        <Image
          src="/webCam.png"
          width={200}
          height={200}
          className="absolute"
          alt="Webcam overlay"
        />
        <Webcam
          mirrored={true}
          style={{
            height: 300,
            width: "100%",
            zIndex: 10,
          }}
        />
      </div>
      <Button
        disabled={loading}
        variant="outline"
        className="my-10 flex items-center gap-2"
        onClick={StartStopRecording}
      >
        {isRecording ? (
          <>
            <Square className="text-red-600" />
            <span className="text-red-600 animate-pulse flex gap-2 items-center">Stop Recording</span>
          </>
        ) : (
          <>
            <Mic />
            <span>Record Answer</span>
          </>
        )}
      </Button>
    </div>
  );
}

export default RecordAnswerSection;
