import { useState, useRef, useCallback } from 'react'
import Papa from 'papaparse'
import { toast } from 'react-hot-toast'
import { supabase, TABLES } from '@/lib/supabase'
import { validateCSVRow, csvRowToMatch, formatBytes } from '@/lib/utils'
import { Match, CSVRow, ValidationError, UploadResult } from '@/types'

interface CSVUploaderProps {
  onUploadComplete?: (result: UploadResult) => void
}

export default function CSVUploader({ onUploadComplete }: CSVUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [previewData, setPreviewData] = useState<Match[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ['text/csv', 'application/vnd.ms-excel']
  const PREVIEW_ROWS = 5

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  const validateFile = (selectedFile: File): boolean => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error(`File size exceeds ${formatBytes(MAX_FILE_SIZE)} limit`)
      return false
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return false
    }

    return true
  }

  const handleFileSelect = (selectedFile: File) => {
    if (!validateFile(selectedFile)) return

    setFile(selectedFile)
    parseCSV(selectedFile)
  }

  const parseCSV = (csvFile: File) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CSVRow[]
        setCsvData(data)
        
        // Validate all rows
        const errors: ValidationError[] = []
        data.forEach((row, index) => {
          const rowErrors = validateCSVRow(row, index + 1)
          errors.push(...rowErrors)
        })
        
        setValidationErrors(errors)
        
        // Create preview data from valid rows
        const validRows = data.filter((_, index) => {
          return !errors.some(error => error.row === index + 1)
        })
        
        const preview = validRows.slice(0, PREVIEW_ROWS).map(csvRowToMatch)
        setPreviewData(preview)

        if (errors.length === 0) {
          toast.success(`${data.length} rows parsed successfully`)
        } else {
          toast.error(`Found ${errors.length} validation errors`)
        }
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`)
      }
    })
  }

  const handleUploadToDatabase = async () => {
    if (!csvData.length) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Filter out rows with validation errors
      const validData = csvData.filter((_, index) => {
        return !validationErrors.some(error => error.row === index + 1)
      })

      if (validData.length === 0) {
        toast.error('No valid data to upload')
        setIsUploading(false)
        return
      }

      const matches = validData.map(csvRowToMatch)
      const batchSize = 100
      let processed = 0

      for (let i = 0; i < matches.length; i += batchSize) {
        const batch = matches.slice(i, i + batchSize)
        
        const { error } = await supabase
          .from(TABLES.MATCHES)
          .insert(batch)

        if (error) throw error

        processed += batch.length
        setUploadProgress((processed / matches.length) * 100)
      }

      const result: UploadResult = {
        success: true,
        message: `Successfully uploaded ${processed} matches`,
        processed,
        errors: validationErrors
      }

      toast.success(result.message)
      onUploadComplete?.(result)
      
      // Reset state
      setFile(null)
      setCsvData([])
      setValidationErrors([])
      setPreviewData([])
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      toast.error(errorMessage)
      
      const result: UploadResult = {
        success: false,
        message: errorMessage,
        processed: 0,
        errors: validationErrors
      }
      
      onUploadComplete?.(result)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setCsvData([])
    setValidationErrors([])
    setPreviewData([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">CSV Match Data Upload</h2>
        
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-primary-400 bg-primary-50'
              : file
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0]
              if (selectedFile) handleFileSelect(selectedFile)
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            {file ? (
              <>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg font-medium">File Selected</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{file.name}</p>
                  <p>{formatBytes(file.size)} • {csvData.length} rows</p>
                </div>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 text-gray-400 mx-auto" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="text-lg font-medium text-gray-900">Drop your CSV file here</p>
                  <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* File Requirements */}
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Required CSV Columns:</h3>
          <div className="text-xs text-blue-800 space-y-1">
            <p><code>home_team, away_team, score_home, score_away, score_home_ht, score_away_ht, date</code></p>
            <p>• Date format: YYYY-MM-DD • Max file size: {formatBytes(MAX_FILE_SIZE)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {file && (
          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleUploadToDatabase}
              disabled={isUploading || validationErrors.length === csvData.length}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload to Database'}
            </button>
            <button
              onClick={resetUpload}
              disabled={isUploading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-red-900 mb-4">
            Validation Errors ({validationErrors.length})
          </h3>
          <div className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {validationErrors.slice(0, 50).map((error, index) => (
                <div key={index} className="flex text-sm">
                  <span className="text-red-600 font-medium w-16">Row {error.row}:</span>
                  <span className="text-red-700">{error.field} - {error.error}</span>
                </div>
              ))}
              {validationErrors.length > 50 && (
                <p className="text-sm text-gray-500 mt-2">
                  ... and {validationErrors.length - 50} more errors
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Data Preview */}
      {previewData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Data Preview (First {previewData.length} valid rows)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Home Team</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Away Team</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">FT Score</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">HT Score</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((match, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">{match.home_team}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{match.away_team}</td>
                    <td className="px-3 py-2 text-sm text-center text-gray-900">
                      {match.score_home} - {match.score_away}
                    </td>
                    <td className="px-3 py-2 text-sm text-center text-gray-500">
                      {match.score_home_ht} - {match.score_away_ht}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">{match.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
