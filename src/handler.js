const { nanoid } = require('nanoid')
const books = require('./books')

/**
 * addBookHandler untuk menangani aksi tambah buku
 * @param {*} request menerima request dari client
 * @param {*} h inisialisasi dari hapi untuk selanjutnya digunakan untuk membuat response
 * @returns response
 */
const addBookHandler = (request, h) => {
  // ambil data dari payload
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload

  // kirim response fail jika nama kosong
  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku'
    })
    response.code(400)
    return response
  }

  // kirim response fail jika halaman baca melebihi halaman total buku
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
    })
    response.code(400)
    return response
  }

  // data tambahan yang dibutuhkan
  const id = nanoid(16)
  const insertedAt = new Date().toISOString()
  const updatedAt = insertedAt
  const finished = pageCount === readPage

  // tambahkan buku kedalam array
  const newBook = {
    id, name, year, author, summary, publisher, pageCount, readPage, reading, finished, insertedAt, updatedAt
  }
  books.push(newBook)

  // cek apakah sukses menambahkan buku ke dalam array
  const isSuccess = books.filter((book) => book.id === id).length > 0

  // kirim response success jika berhasil menambahkan buku
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id
      }
    })
    response.code(201)
    return response
  }
}

/**
 * getAllBookHandler untuk mengirim semua data buku
 * @param {*} request menerima request dari client
 * @param {*} h inisialisasi dari hapi untuk selanjutnya digunakan untuk membuat response
 * @returns response
 */
const getAllBookHandler = (request, h) => {
  // ambil data dari query url
  const { name, reading, finished } = request.query

  // siapkan data buku
  let filtered = books

  // filter name
  if (name) {
    filtered = filtered.filter(val => val.name.toLowerCase().includes(name.toLowerCase()))
  }

  // filter reading
  if (reading === '0') {
    filtered = filtered.filter(val => val.reading === false)
  } else if (reading === '1') {
    filtered = filtered.filter(val => val.reading === true)
  }

  // filter finished
  if (finished === '0') {
    filtered = filtered.filter(val => val.finished === false)
  } else if (finished === '1') {
    filtered = filtered.filter(val => val.finished === true)
  }

  // hanya kirimkan data id, name, dan publisher
  const filteredBook = filtered.map(({ id, name, publisher }) => {
    return { id, name, publisher }
  })

  return {
    status: 'success',
    data: {
      books: filteredBook
    }
  }
}

/**
 * getBookByIdHandler untuk mengambil data buku berdasarkan Id buku
 * @param {*} request menerima request dari client
 * @param {*} h inisialisasi dari hapu untuk selanjutnya digunakan untuk membuat response
 * @returns response
 */
const getBookByIdHandler = (request, h) => {
  // ambil data dari parameter url
  const { id } = request.params

  // ambil data buku berdasarkan id
  const book = books.filter((n) => n.id === id)[0]

  // kirimkan response success jika data buku ditemukan
  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book
      }
    }
  }

  // kirimkan response fail jika buku tidak ditemukan
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan'
  })
  response.code(404)
  return response
}

/**
 * editBookByIdHandler untuk mendapatkan data buku sesuai id lalu selanjutnya diedit
 * @param {*} request menerima request dari client
 * @param {*} h inisialisasi dari hapi untuk selanjutnya digunakan untuk membuat response
 * @returns response
 */
const editBookByIdHandler = (request, h) => {
  // ambil data dari parameter url
  const { id } = request.params

  // ambil data dari payload
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload

  // kirim response fail jika nama kosong
  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku'
    })
    response.code(400)
    return response
  }

  // kirim response fail jika halaman baca melebihi halaman total buku
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
    })
    response.code(400)
    return response
  }

  // tetapkan nilai updatedAt dengan waktu sekarang
  const updatedAt = new Date().toISOString()

  // cari buku berdasarkan Id
  const index = books.findIndex((book) => book.id === id)

  // kirim response success jika indexnya bukan -1
  if (index !== -1) {
    books[index] = {
      ...books[index], name, year, author, summary, publisher, pageCount, readPage, reading, updatedAt
    }
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui'
    })
    response.code(200)
    return response
  }
  // kirim response fail jika index buku adalah -1
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan'
  })
  response.code(404)
  return response
}

/**
 * deleteBookByIdHandler untuk menangani aksi hapus data buku
 * @param {*} request menerima request dari client
 * @param {*} h inisialisasi dari hapi untuk selanjutnya digunakan untuk membuat response
 * @returns response
 */
const deleteBookByIdHandler = (request, h) => {
  // ambil data dari parameter url
  const { id } = request.params

  // cari buku berdasarkan Id
  const index = books.findIndex((note) => note.id === id)

  // kirim response success jika index buku bukan -1
  if (index !== -1) {
    books.splice(index, 1)
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus'
    })
    response.code(200)
    return response
  }

  // kirim response fail jika indexnya adalah -1
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan'
  })
  response.code(404)
  return response
}

module.exports = { addBookHandler, getAllBookHandler, getBookByIdHandler, editBookByIdHandler, deleteBookByIdHandler }
