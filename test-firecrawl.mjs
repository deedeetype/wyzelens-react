/**
 * FireCrawl API Test
 * Quick validation that our API key works
 */

import Firecrawl from '@mendable/firecrawl-js'

const FIRECRAWL_API_KEY = 'fc-1b87aaf94bb74139aff5785c73a0e779'

async function testFirecrawl() {
  console.log('🔥 Testing FireCrawl API...\n')
  
  const firecrawl = new Firecrawl({ apiKey: FIRECRAWL_API_KEY })
  
  try {
    // Test 1: Simple scrape with markdown
    console.log('Test 1: Simple scrape (markdown only)')
    const simpleResult = await firecrawl.scrape('https://firecrawl.dev', {
      formats: ['markdown']
    })
    console.log('✅ Markdown length:', simpleResult.markdown?.length || 0)
    console.log('✅ Title:', simpleResult.metadata?.title || 'N/A')
    console.log()
    
    // Test 2: Structured extraction with JSON format
    console.log('Test 2: Structured extraction (JSON format)')
    const structuredResult = await firecrawl.scrape('https://firecrawl.dev', {
      formats: [{
        type: 'json',
        schema: {
          type: 'object',
          properties: {
            company_name: { type: 'string' },
            tagline: { type: 'string' },
            main_features: { 
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['company_name']
        }
      }]
    })
    console.log('✅ Extracted data:', JSON.stringify(structuredResult.json, null, 2))
    console.log()
    
    // Test 3: Multiple formats (markdown + links + screenshot)
    console.log('Test 3: Multiple formats (markdown + links + screenshot)')
    const multiResult = await firecrawl.scrape('https://firecrawl.dev', {
      formats: ['markdown', 'links', 'screenshot']
    })
    console.log('✅ Links found:', multiResult.links?.length || 0)
    console.log('✅ Screenshot URL:', multiResult.screenshot ? 'Generated ✓' : 'N/A')
    console.log()
    
    console.log('🎉 All tests passed! FireCrawl is ready to use.\n')
    
  } catch (error) {
    console.error('❌ FireCrawl test failed:')
    console.error(error.message)
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    }
    process.exit(1)
  }
}

testFirecrawl()
