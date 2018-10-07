import {ReflectMetadata} from '@nestjs/common'

export const PERMISSION_DEFINITION = '__permission_definition__'

export const Permission = (options: { name: string, identify: string, action: 'create' | 'delete' | 'update' | 'find' }) => ReflectMetadata(PERMISSION_DEFINITION, options)
