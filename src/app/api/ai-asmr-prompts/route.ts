import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'asmr_templates.json')
    const jsonData = fs.readFileSync(jsonPath, 'utf8')
    const templates = JSON.parse(jsonData)
    
    return NextResponse.json({
      success: true,
      data: templates
    })
  } catch (error) {
    console.error('Error reading ASMR templates:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load ASMR templates' 
      },
      { status: 500 }
    )
  }
}