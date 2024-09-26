# Pixel Craft

This repository contains a project called Pixel Craft, developed using TypeScript.

## Description

Pixel Craft is a web application that allows users to create pixel art designs with ease. It provides a user-friendly interface for drawing and customizing pixel art graphics. Whether you are a beginner or an experienced pixel artist, Pixel Craft caters to all skill levels.

## Features

- User-friendly interface for drawing pixel art
- Various color palettes and brush sizes to choose from
- Save and export pixel art designs as PNG images
- Undo/redo functionality for easier edits
- Grid overlay to assist with precise drawing

## Technologies Used

- TypeScript
- HTML
- CSS

## Prerequisites

Before getting started, ensure that you have the following:
- Node.js installed on your system
- npm package manager

## Installation

Follow these steps to set up the Pixel Craft project on your local machine:

1. Clone the repository:

```bash
git clone https://github.com/your-username/Pixel_Craft.git
```

2. Install dependencies:

```bash
npm install
```

## Configuration

No additional configuration is required for this project.

## Usage

To use Pixel Craft, open the project in a browser and start creating pixel art designs by selecting colors and drawing on the canvas.

Example code snippet for drawing a blue pixel:

```typescript
const canvas = document.getElementById('pixel-canvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'blue';
ctx.fillRect(x, y, pixelSize, pixelSize);
```

## API Reference

Pixel Craft does not have a specific API, as it is a standalone web application.


