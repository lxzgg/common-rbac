import {ReflectMetadata} from '@nestjs/common'

export const PERMISSION_DEFINITION = '__permission_definition__'

/**
 * 权限注解
 */
export const Permission = (options: { name: string, identify: string }) => ReflectMetadata(PERMISSION_DEFINITION, options)
