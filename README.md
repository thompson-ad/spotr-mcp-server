# Spotr MCP

A Model Context Protocol (MCP) server designed to augment Claude with fitness coaching capabilities for the Spotr platform.

## Overview

SpotrFitnessServer acts as a bridge between Claude and the Spotr fitness web application. It enables Claude to access coaching data and store generated fitness programs in your database.

## Features

- Generate personalized fitness programs for clients
- Create program blueprints that can be reused for multiple clients
- Refresh and tweak existing programs
- Analyze client progress and program effectiveness
- Answer questions about programs

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- API access to your fitness backend

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/spotr-mcp-server.git

# Install dependencies
cd spotr-mcp-server
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API credentials
```

### Running the Server

```bash
# Start the server
node server.js
```

## Example Usage

```
User: "Could you create a strength training program for my client Sarah? She's a 35-year-old intermediate lifter who wants to focus on upper body strength."

Claude: "I've created an 8-week upper body strength program for Sarah and saved it to your Spotr app. The program includes 4 training days per week with a focus on progressive overload for key upper body movements.

You and Sarah can access the full program here: https://app.spotr.coach/programs/123456"
```

## Project Structure

- `server.js`: Main entry point that sets up the MCP server
- `.env`: Environment variables configuration
- `resources/`: MCP resources for accessing coach and client data
- `tools/`: MCP tools for storing and manipulating programs
- `prompts/`: MCP prompts for program generation and analysis

## License

[License information]

## Acknowledgments

This project uses the Model Context Protocol developed by Anthropic.
