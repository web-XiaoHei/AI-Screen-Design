/**
 * 存到localStorage中，方便预览和发布
 */

const SCREEN_PUBLISH = 'screen_published'
export function publishPage(Page: PageSchema) {
  const value: string | Record<string, PageSchema> = localStorage.getItem(SCREEN_PUBLISH) || '{}'
  if (typeof value === 'string') {
    try {
      const parsedValue = JSON.parse(value)
      if (typeof parsedValue === 'object' && parsedValue !== null) {
        Object.assign(parsedValue, Page)
      } else {
        console.warn('Published page is not an object, overwriting with new page.')
        localStorage.setItem(SCREEN_PUBLISH, JSON.stringify(Page))
      }
    } catch (error) {
      console.error('Failed to parse published page:', error)
      localStorage.setItem(SCREEN_PUBLISH, JSON.stringify(Page))
    }
  } else {
    localStorage.setItem(SCREEN_PUBLISH, JSON.stringify(Page))
  }
}

export function getPublishedPage(): PageSchema | null {
  const pageStr = localStorage.getItem(SCREEN_PUBLISH)

  if (pageStr) {
    try {
      return JSON.parse(pageStr) as PageSchema
    } catch (error) {
      console.error('Failed to parse published page:', error)
      return null
    }
  } else {
    return null
  }
}
