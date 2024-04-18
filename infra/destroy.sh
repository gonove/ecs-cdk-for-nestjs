#!/bin/bash

stack_name="NestJS-Stack"

while true; do
    status=$(aws cloudformation describe-stacks --stack-name $stack_name --query 'Stacks[0].StackStatus' --output text)

    if [ "$status" == "UPDATE_ROLLBACK_COMPLETE" ]; then
        echo "Stack rollback completed successfully. Stack can now be deleted."
        aws cloudformation delete-stack --stack-name $stack_name
        break
    elif [ "$status" != "UPDATE_ROLLBACK_IN_PROGRESS" ]; then
        echo "Stack is not in UPDATE_ROLLBACK_IN_PROGRESS status. Exiting."
        break
    else
        echo "Waiting for rollback to complete..."
        sleep 60 # Espera 1 minuto antes de volver a verificar
    fi
done
