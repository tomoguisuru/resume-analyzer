import React, { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { AIResponseFormat, prepareInstructions } from "~/constants";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

export const meta = () => [
  { title: "Resumind | Resume Analyzer" },
  {
    name: "description",
    content: "Enter the job details and upload your resume",
  },
];

interface IResumeForm {
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  file: File;
}

function upload() {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: IResumeForm) => {
    setIsProcessing(true);
    setStatusText("Preparing analysis...");

    const uploadedFile = await fs.upload([file]);

    if (!uploadedFile) {
      setStatusText("Error: File upload failed!");
      return;
    }

    setStatusText("Creating an image of your PDF...");

    const imageFile = await convertPdfToImage(file);

    if (!imageFile.file) {
      setStatusText("Error: Failed to create PDF image");
      return;
    }

    setStatusText("Uploading image...");

    const uploadedImage = await fs.upload([imageFile.file]);

    if (!uploadedImage) {
      setStatusText("Error: Image upload failed!");
      return;
    }

    setStatusText("Preparing data...");

    const uuid = generateUUID();
    const data = {
      companyName,
      jobDescription,
      jobTitle,
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      feedback: "",
    };

    const resumeKey = `resume:${uuid}`;

    await kv.set(resumeKey, JSON.stringify(data));

    setStatusText("Analyzing...");

    const feedback = await ai.feedback(
      uploadedFile.path,
      prepareInstructions({ jobTitle, jobDescription, AIResponseFormat })
    );

    if (!feedback) {
      setStatusText("Error: Failed to analyze resume");
    }

    const feedbackText =
      typeof feedback?.message.content === "string"
        ? feedback.message.content
        : feedback?.message.content[0].text;

    data.feedback = JSON.parse(feedbackText);

    await kv.set(resumeKey, JSON.stringify(data));

    setStatusText("Analysis complete, redirecting...");

    // TODO: Ship the data
    console.log(data);
    navigate(`/resume/${uuid}`);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");

    if (!form || !file) {
      return;
    }

    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  // Check to see if the user is authenticated, ship off to auth if not
  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/auth?next=/upload");
    }
  }, [auth.isAuthenticated]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}

          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                  id="job-description"
                />
              </div>

              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default upload;
