#!/bin/bash

# Remove existing virtual environment
rm -rf .venv

# Create new virtual environment
uv venv

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
uv pip install -r requirements.txt
