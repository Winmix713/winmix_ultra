import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CSVRow, ValidationError, Match } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateCSVRow(row: CSVRow, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = []
  const requiredFields = ['home_team', 'away_team', 'score_home', 'score_away', 'score_home_ht', 'score_away_ht', 'date']
  
  // Check required fields
  for (const field of requiredFields) {
    if (!row[field] || row[field].trim() === '') {
      errors.push({
        row: rowIndex,
        field,
        value: row[field] || '',
        error: `${field} is required`
      })
    }
  }
  
  // Validate numeric fields
  const numericFields = ['score_home', 'score_away', 'score_home_ht', 'score_away_ht']
  for (const field of numericFields) {
    if (row[field] && isNaN(parseInt(row[field]))) {
      errors.push({
        row: rowIndex,
        field,
        value: row[field],
        error: `${field} must be a valid number`
      })
    }
  }
  
  // Validate date format
  if (row.date && !isValidDate(row.date)) {
    errors.push({
      row: rowIndex,
      field: 'date',
      value: row.date,
      error: 'Date must be in YYYY-MM-DD format'
    })
  }
  
  return errors
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

export function csvRowToMatch(row: CSVRow): Match {
  return {
    home_team: row.home_team.trim(),
    away_team: row.away_team.trim(),
    score_home: parseInt(row.score_home),
    score_away: parseInt(row.score_away),
    score_home_ht: parseInt(row.score_home_ht),
    score_away_ht: parseInt(row.score_away_ht),
    date: row.date.trim()
  }
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
