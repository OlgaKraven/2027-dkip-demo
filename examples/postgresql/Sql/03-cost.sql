SELECT order_id, total_cost,
       CASE WHEN total_cost IS NULL THEN 'Недостаточно норм или цен на дату заказа'
            ELSE 'Расчёт выполнен'
       END AS cost_status
FROM order_cost WHERE order_id=1;
-- Ожидается 14374.28 при допущениях docs/DECISIONS.md.
