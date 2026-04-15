/**
 * Competitor Intelligence POC - NAPA Canada
 * Test enrichment pipeline with real competitor
 */

import Firecrawl from '@mendable/firecrawl-js'

const FIRECRAWL_API_KEY = 'fc-1b87aaf94bb74139aff5785c73a0e779'

async function enrichNapaCanada() {
  console.log('🎯 Enriching Competitor: NAPA Canada\n')
  console.log('━'.repeat(60))
  
  const firecrawl = new Firecrawl({ apiKey: FIRECRAWL_API_KEY })
  const domain = 'www.napacanada.com'
  
  const results = {
    competitor: 'NAPA Canada',
    domain: domain,
    enriched_at: new Date().toISOString(),
    data: {}
  }
  
  try {
    // 1. Homepage Intelligence
    console.log('\n📊 Step 1: Homepage Intelligence')
    console.log('   Scraping https://napacanada.com...')
    
    const homepage = await firecrawl.scrape(`https://${domain}`, {
      formats: ['markdown', {
        type: 'json',
        schema: {
          type: 'object',
          properties: {
            company_description: { type: 'string' },
            main_products: { 
              type: 'array',
              items: { type: 'string' }
            },
            key_value_propositions: {
              type: 'array',
              items: { type: 'string' }
            },
            headquarters: { type: 'string' },
            contact_info: {
              type: 'object',
              properties: {
                phone: { type: 'string' },
                email: { type: 'string' }
              }
            }
          }
        }
      }, 'links', 'screenshot']
    })
    
    results.data.homepage = {
      title: homepage.metadata?.title,
      description: homepage.metadata?.description,
      structured_data: homepage.json,
      links_found: homepage.links?.length || 0,
      screenshot_url: homepage.screenshot || null
    }
    
    console.log('   ✅ Title:', homepage.metadata?.title)
    console.log('   ✅ Description:', homepage.metadata?.description?.substring(0, 100) + '...')
    console.log('   ✅ Links found:', homepage.links?.length || 0)
    console.log('   ✅ Screenshot:', homepage.screenshot ? 'Generated' : 'N/A')
    
    // 2. Social Media Links Detection
    console.log('\n🌐 Step 2: Social Media Detection')
    const socialLinks = homepage.links?.filter(link => 
      link.includes('linkedin.com') || 
      link.includes('twitter.com') || 
      link.includes('facebook.com') ||
      link.includes('instagram.com') ||
      link.includes('youtube.com')
    ) || []
    
    results.data.social_media = {
      linkedin: socialLinks.find(l => l.includes('linkedin.com')) || null,
      twitter: socialLinks.find(l => l.includes('twitter.com')) || null,
      facebook: socialLinks.find(l => l.includes('facebook.com')) || null,
      instagram: socialLinks.find(l => l.includes('instagram.com')) || null,
      youtube: socialLinks.find(l => l.includes('youtube.com')) || null
    }
    
    Object.entries(results.data.social_media).forEach(([platform, url]) => {
      if (url) {
        console.log(`   ✅ ${platform.charAt(0).toUpperCase() + platform.slice(1)}:`, url)
      }
    })
    
    // 3. About/Company Page
    console.log('\n🏢 Step 3: Company Information')
    const aboutUrls = homepage.links?.filter(link => 
      link.includes('/about') || 
      link.includes('/company') ||
      link.includes('/who-we-are')
    ) || []
    
    if (aboutUrls.length > 0) {
      console.log(`   Found ${aboutUrls.length} potential about pages`)
      console.log('   Scraping:', aboutUrls[0])
      
      const aboutPage = await firecrawl.scrape(aboutUrls[0], {
        formats: ['markdown', {
          type: 'json',
          schema: {
            type: 'object',
            properties: {
              company_history: { type: 'string' },
              employee_count: { type: 'string' },
              number_of_locations: { type: 'string' },
              mission_statement: { type: 'string' }
            }
          }
        }]
      })
      
      results.data.about = aboutPage.json
      console.log('   ✅ About page data extracted')
    } else {
      console.log('   ⚠️  No about page found')
    }
    
    // 4. Careers/Jobs Page (Growth Signal)
    console.log('\n💼 Step 4: Careers Page (Growth Signal)')
    const careerUrls = homepage.links?.filter(link => 
      link.includes('/career') || 
      link.includes('/jobs') ||
      link.includes('/join')
    ) || []
    
    if (careerUrls.length > 0) {
      console.log(`   Found ${careerUrls.length} career pages`)
      console.log('   Scraping:', careerUrls[0])
      
      const careersPage = await firecrawl.scrape(careerUrls[0], {
        formats: ['markdown', {
          type: 'json',
          schema: {
            type: 'object',
            properties: {
              open_positions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    department: { type: 'string' },
                    location: { type: 'string' }
                  }
                }
              }
            }
          }
        }]
      })
      
      results.data.careers = {
        positions_count: careersPage.json?.open_positions?.length || 0,
        positions: careersPage.json?.open_positions || []
      }
      
      console.log('   ✅ Open positions:', results.data.careers.positions_count)
    } else {
      console.log('   ⚠️  No careers page found')
    }
    
    // 5. News/Blog (Latest Updates)
    console.log('\n📰 Step 5: News/Blog Detection')
    const newsUrls = homepage.links?.filter(link => 
      link.includes('/news') || 
      link.includes('/blog') ||
      link.includes('/press')
    ) || []
    
    if (newsUrls.length > 0) {
      console.log(`   Found ${newsUrls.length} news/blog pages`)
      results.data.news = {
        news_page_url: newsUrls[0],
        has_blog: true
      }
      console.log('   ✅ News page:', newsUrls[0])
    } else {
      console.log('   ⚠️  No news/blog page found')
      results.data.news = { has_blog: false }
    }
    
    // Summary
    console.log('\n' + '━'.repeat(60))
    console.log('📋 ENRICHMENT SUMMARY')
    console.log('━'.repeat(60))
    console.log(JSON.stringify(results, null, 2))
    console.log('\n✅ Competitor enrichment completed successfully!')
    
    return results
    
  } catch (error) {
    console.error('\n❌ Enrichment failed:')
    console.error(error.message)
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    }
    throw error
  }
}

// Run the enrichment
enrichNapaCanada().catch(console.error)
