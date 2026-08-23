import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom persists the document between tests in a file, so a component left mounted by one
// test is still in the tree for the next — which shows up as a duplicate-match error in
// the test that did nothing wrong.
afterEach(cleanup)
