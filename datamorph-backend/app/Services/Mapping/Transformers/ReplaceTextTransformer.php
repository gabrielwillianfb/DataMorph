<?php

namespace App\Services\Mapping\Transformers;

class ReplaceTextTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): mixed
    {
        if (!is_string($value)) {
            return $value;
        }

        if (isset($options['dictionary']) && is_array($options['dictionary'])) {
            foreach ($options['dictionary'] as $search => $replace) {
                $value = str_ireplace((string)$search, (string)$replace, $value);
            }
        }

        if (!empty($options['search'])) {
            $search = (string)$options['search'];
            $replace = (string)($options['replace'] ?? '');
            $caseSensitive = (bool)($options['case_sensitive'] ?? false);

            $value = $caseSensitive
                ? str_replace($search, $replace, $value)
                : str_ireplace($search, $replace, $value);
        }

        return $value;
    }
}
