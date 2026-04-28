# FairnessEngine: AI Bias Diagnostic Suite

FairnessEngine is a professional-grade diagnostic dashboard designed to detect, audit, and mitigate algorithmic bias in machine learning models and datasets. It leverages advanced AI techniques and traditional statistical fairness metrics to provide a comprehensive view of model behavior.

## 🚀 Key Features

- **AI-Native Detection**: Automatically identifies sensitive attributes and target variables in datasets using Gemini model semantic analysis.
- **Counterfactual Persona Audit**: Generates professionally identical personas with differing protected attributes to test a model's true decision logic via API.
- **Quantitative Metrics**: Real-time calculation of industry-standard metrics:
  - **Disparate Impact**: Based on the U.S. EEOC 4/5ths Rule.
  - **Statistical Parity Difference**: Measuring outcome distributions between privileged and unprivileged groups.
- **On-the-fly Mitigation**: Implements reweighing algorithms to balance datasets and visualize the impact of fairness interventions immediately.
- **Professional Reports**: Export detailed fairness audits and diagnostic results in CSV format.
- **Interactive Visualizations**: High-fidelity charts and dashboards built with Recharts and Motion.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Intelligence**: Google Gemini API (`@google/genai`)
- **Animations**: Motion
- **Data Visualization**: Recharts
- **Parsing**: PapaParse

## 🚦 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- A Google Gemini API Key (obtainable from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd fairness-engine
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your API key:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   APP_URL="http://localhost:3000"
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Deploying to Vercel

1. **Push your code to GitHub.**
2. **Import the project into Vercel.**
3. **Configure Environment Variables:**
   - In the Vercel dashboard, go to **Settings > Environment Variables**.
   - Add `GEMINI_API_KEY` with your key from the Google AI Studio/Cloud Console.
4. **Deploy.**

## 📖 Usage

1. **Upload Data**: Start by uploading a CSV dataset or use the provided sample data.
2. **AI Analysis**: The system will automatically suggest target outcomes and protected attributes.
3. **Audit**: Review the disparate impact ratio and statistical parity difference.
4. **Mitigate**: Apply the reweighing algorithm to see how fairness can be improved.
5. **Model Audit**: Use the Model Audit tab to run counterfactual tests against an API endpoint.

## ⚖️ License

SPDX-License-Identifier: Apache-2.0
