Íme a teljes rendszerre vonatkozó fejlesztői .md formátumú dokumentáció – minden prompttal, lépéssel, modullal. Ez önálló útmutatóként is használható bármely fejlesztő számára, aki a projektet átveszi és végigviszi. A dokumentum követi a 10/10 minőségi elveket: jól struktúrált, bővíthető, tanítható, prediktív rendszer, modern tech stacken.

⬇️ Teljes tartalom alább Markdown formátumban:

# Football Prediction System – Developer Prompt Guide (10/10 Architecture)

Author: System Architect
Version: 1.0
Stack: React + Supabase + FastAPI + Python ML + TailwindCSS

## Overview

This project builds a complete football match prediction and analytics platform that supports:

* Match upload via CSV (admin-controlled)
* Feature engineering and stats generation
* Fully parameterized prediction engine
* Machine learning model (trainable/retrainable)
* Supabase-managed PostgreSQL database with security
* Admin panel for controlling the system
* JSON & chart-based explainability

## Tech Stack

* Supabase (PostgreSQL, Auth, Edge Functions, Storage)
* React + Tailwind + shadcn/ui (Frontend + Admin Panel)
* FastAPI + Python + XGBoost/LightGBM (Prediction engine)
* Recharts (for charting)
* Papaparse (CSV import)
* Vercel / Netlify (Deployment)

## Directory

* \[Phase I] System foundation
* \[Phase II] Machine learning system
* \[Phase III] Advanced features & explainability

# PHASE I – Base System Setup

## Step 1 – Supabase Schema Definition

Prompt:

Create a PostgreSQL schema for storing football matches in Supabase.

Required fields:

* home\_team text
* away\_team text
* score\_home int
* score\_away int
* score\_home\_ht int
* score\_away\_ht int
* date date

SQL:

create table matches (
id serial primary key,
home\_team text not null,
away\_team text not null,
score\_home int not null,
score\_away int not null,
score\_home\_ht int not null,
score\_away\_ht int not null,
date date not null
);

Also create a prediction\_settings table:

create table prediction\_settings (
id uuid primary key default uuid\_generate\_v4(),
recent\_weight float,
home\_advantage float,
goal\_multiplier float,
half\_time\_weight float,
min\_matches int,
updated\_at timestamp default now()
);

## Step 2 – Admin Panel Setup

Prompt:

Build a secure admin panel in React using Tailwind CSS, shadcn/ui, and Supabase Auth.
Main navigation tabs:

* Match Upload (CSV)
* Prediction Settings
* Model Management
* System Logs

Use react-router for page structure. Protect all routes via Supabase Auth.

## Step 3 – CSV Upload Component

Prompt:

Create a CSVUploader component that allows uploading past match results in .csv format.

* Parse CSV using papaparse
* Validate each row before upload (check all required columns)
* Insert into Supabase table matches via @supabase/supabase-js
* Show toast on success or error
* Show preview of parsed records (first 5 rows)

Expected fields in CSV:

* home\_team
* away\_team
* score\_home
* score\_away
* score\_home\_ht
* score\_away\_ht
* date

## Step 4 – Prediction Settings Customization

Prompt:

Create a PredictionSettings page with sliders and number inputs for customizing the prediction model.
All settings are stored in the prediction\_settings table in Supabase.

Parameters:

* recent\_weight (0–1 slider)
* home\_advantage (-1 to +1 slider)
* goal\_multiplier (float input)
* half\_time\_weight (0–1 slider)
* min\_matches (int input)

## Step 5 – Prediction Score Preview Chart

Prompt:

Create a Live Preview using recharts that shows how prediction settings affect the predictionScore value.
Generate a dummy prediction series (12 matches) based on the weights.

# PHASE II – Machine Learning Integration

## Step 6 – Feature Engineering Pipeline

Prompt:

Create a Supabase Edge Function or NodeJS cron job that:

* Fetches recent matches
* Computes engineered\_features (goal averages, form, ELO, etc.)
* Stores feature rows into an engineered\_features table

Sample fields:

* team\_id
* opponent
* avg\_goals\_last\_5
* form\_score
* home\_win\_rate
* elo\_score
* half\_time\_score\_ratio
* date

## Step 7 – Python ML Service (FastAPI)

Prompt:

Create a FastAPI microservice with these endpoints:

* /predict → returns prediction given two teams and a match date
* /train → retrains the model using engineered\_features
* /explain → returns feature importance (SHAP values or built-in importance from XGBoost/LightGBM)

Model:

* XGBoost or LightGBM for classification (home/draw/away)
* Train from engineered\_features table (from Supabase)
* Store model as .pkl in Supabase Storage
* Version model in table model\_versions

## Step 8 – Admin Model Controls

Prompt:

Add a new tab “Model Management” in the admin panel.

Functions:

* Train model now (button → calls /train)
* Display current model accuracy
* Show current model version
* Export model summary as JSON

## Step 9 – Scheduled Retraining

Prompt:

Use Supabase scheduled functions or CRON job (GitHub Actions) to call /train once per week.

After training:

* Save model to storage
* Update model\_versions table

## Step 10 – Prediction Request Integration

Prompt:

From the admin panel, allow testing the prediction engine by selecting two teams and a date.
Send the data to /predict and show the output:

* Predicted outcome (home/draw/away)
* Probability per class
* Confidence score
* Feature importance (optional)

# PHASE III – Advanced Features

## Step 11 – SHAP Explainability

Prompt:

Extend /explain endpoint to return SHAP values.
Display results in bar chart in Admin (Top 5 most influential features).
Allow clicking on a feature to show SHAP contribution chart.

## Step 12 – Prediction Logging + Audit

Prompt:

Create a predictions\_log table:

* id
* request\_id
* input\_features (JSON)
* output (JSON: predicted label + probabilities)
* model\_version
* created\_at

Every /predict request logs into this table.
Add a page in admin to search logs by team/date/model version.

## Step 13 – Data Quality Panel

Prompt:

Add a page in the admin panel to show data quality issues.

Checks:

* Missing score fields
* Unusual score values (> 10 goals)
* Duplicate matches
* Mismatched dates

## Step 14 – Row-Level Security Setup

Prompt:

Use Supabase RLS policies to ensure only users with role admin can:

* INSERT INTO matches
* UPDATE prediction\_settings
* TRAIN models
* View logs

Create a roles column in auth.users or via Supabase Auth hook.

## Step 15 – Data Export

Prompt:

Add export buttons to allow:

* Exporting matches as CSV
* Exporting prediction\_settings as JSON
* Exporting model\_versions as JSON
* Exporting parsed CSV upload as JSON

Use Blob and URL.createObjectURL for download links.

—

End of Document ✅

Ha szeretnéd, ebből csinálhatok egy letölthető .md vagy .pdf fájlt – csak szólj!
