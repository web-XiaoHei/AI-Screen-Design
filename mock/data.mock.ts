import Mock from 'mockjs'
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/data',
  method: ['GET', 'POST', 'PUT', 'DELETE'],
  headers: {
    Authorization: '3afb7e626f85dd00339daa557cdb65af68a6dd92c059f5761c0e3b0e9a69c987',
  },
  body: (request) => {
    const date = request?.query?.date ?? '2026-01-01'
    const seed = Number(date.slice(0, 4)) || 2026

    return Mock.mock({
      code: 200,
      data: {
        'list|10': [
          {
            'label|+1': [
              '一月',
              '二月',
              '三月',
              '四月',
              '五月',
              '六月',
              '七月',
              '八月',
              '九月',
              '十月',
            ],
            'value|100-1000': 1,
          },
        ],
      },
      _meta: {
        seed,
        date,
      },
    })
  },
})
