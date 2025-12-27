"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";

type RentFormValues = {
  name: string;
  mobile: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  file: FileList;
};

type RentAgreement = {
  name: string;
  mobile: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  fileName: string | null;
  filePath: string | null;
};

export default function Home() {
  const { register, handleSubmit, watch, reset } = useForm<RentFormValues>();
  const [message, setMessage] = useState("");
  const [agreements, setAgreements] = useState<RentAgreement[]>([]);

  // Watch the file input
  const file = watch("file");

  useEffect(() => {
    const fetchAgreements = async () => {
      try {
        const res = await fetch("/api/rent");
        const data = await res.json();
        setAgreements(data);
      } catch (error) {
        console.error("Failed to fetch agreements:", error);
      }
    };

    fetchAgreements();
  }, []);

  const onSubmit = async (data: RentFormValues) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("mobile", data.mobile);
    formData.append("tenantName", data.tenantName);
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);

    if (data.file?.length > 0) {
      formData.append("file", data.file[0]);
    }

    const res = await fetch("/api/rent", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    if (result.success) {
      setMessage("Rent agreement submitted successfully!");
      reset();
      // Refresh the agreements list
      const refreshRes = await fetch("/api/rent");
      const refreshData = await refreshRes.json();
      setAgreements(refreshData);
    } else {
      setMessage("Failed to submit agreement");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Rent Agreement Form</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "grid", gap: "10px", maxWidth: "400px" }}
      >
        <input {...register("name", { required: true })} placeholder="Your Name" />
        <input {...register("mobile", { required: true })} placeholder="Mobile Number" type="tel" />
        <input {...register("tenantName", { required: true })} placeholder="Tenant Name" />
        <label>
          Agreement Start:
          <input {...register("startDate", { required: true })} type="date" />
        </label>
        <label>
          Agreement End:
          <input {...register("endDate", { required: true })} type="date" />
        </label>
        <input {...register("file")} type="file" />

        {/* Disable button if file is not selected */}
        <button type="submit" disabled={!file || file.length === 0}>
          Submit Agreement
        </button>
      </form>

      {message && <p>{message}</p>}

      <footer style={{ marginTop: "40px", borderTop: "1px solid #ccc", paddingTop: "20px" }}>
        <h2>Existing Rent Agreements</h2>
        {agreements.length === 0 ? (
          <p>No agreements submitted yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {agreements.map((agreement, index) => (
              <div key={index} style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
                <h3>Agreement {index + 1}</h3>
                <p><strong>Owner:</strong> {agreement.name}</p>
                <p><strong>Mobile:</strong> {agreement.mobile}</p>
                <p><strong>Tenant:</strong> {agreement.tenantName}</p>
                <p><strong>Start Date:</strong> {agreement.startDate}</p>
                <p><strong>End Date:</strong> {agreement.endDate}</p>
                {agreement.filePath && (
                  <p>
                    <strong>File:</strong>{" "}
                    <a
                      href={agreement.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "blue", textDecoration: "underline" }}
                    >
                      {agreement.fileName}
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </footer>
    </div>
  );
}
