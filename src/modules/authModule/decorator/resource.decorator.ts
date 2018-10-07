import {ReflectMetadata} from '@nestjs/common'

export const RESOURCE_DEFINITION = '__resource_definition__'

export const Resource = (options: { name: string, identify: string }) => ReflectMetadata(RESOURCE_DEFINITION, options)
